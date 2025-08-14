import Peer from 'peerjs';
import { importIndexedDBs } from './db';

export interface SyncStatus {
  status: 'idle' | 'waiting' | 'connected' | 'sending' | 'receiving' | 'complete' | 'error';
  message: string;
  code?: string;
  error?: string;
}

export class PeerSync {
  private peer: Peer | null = null;
  private connection: any = null;
  private statusCallback: (status: SyncStatus) => void;

  constructor(statusCallback: (status: SyncStatus) => void) {
    this.statusCallback = statusCallback;
  }

  // Generate a simple readable code
  private generateCode(): string {
    const words = ['cat', 'dog', 'fish', 'bird', 'tree', 'star', 'moon', 'sun', 'rock', 'wave'];
    const word1 = words[Math.floor(Math.random() * words.length)];
    const word2 = words[Math.floor(Math.random() * words.length)];
    const nums = Math.floor(Math.random() * 99).toString().padStart(2, '0');
    return `${word1}-${word2}-${nums}`;
  }

  // Start as sender - generate code and wait for connection
  async startSender(): Promise<void> {
    this.cleanup();
    const code = this.generateCode();

    this.statusCallback({
      status: 'waiting',
      message: 'Initializing...',
      code
    });

    try {
      this.peer = new Peer(code);

      this.peer.on('open', () => {
        this.statusCallback({
          status: 'waiting',
          message: 'Ready! Share this code with the receiving device',
          code
        });
      });

      this.peer.on('connection', (conn) => {
        this.connection = conn;
        
        conn.on('open', () => {
          this.statusCallback({
            status: 'connected',
            message: 'Device connected! Starting data transfer...',
            code
          });
          this.sendData();
        });

        conn.on('error', (err) => {
          this.statusCallback({
            status: 'error',
            message: 'Connection failed',
            error: err.message
          });
        });
      });

      this.peer.on('error', (err) => {
        this.statusCallback({
          status: 'error',
          message: 'Failed to start sender',
          error: err.message
        });
      });

    } catch (error: any) {
      this.statusCallback({
        status: 'error',
        message: 'Failed to initialize',
        error: error.message
      });
    }
  }

  // Connect to sender using their code
  async connectToSender(senderCode: string): Promise<void> {
    this.cleanup();

    this.statusCallback({
      status: 'waiting',
      message: 'Connecting to sender...'
    });

    try {
      this.peer = new Peer();

      this.peer.on('open', () => {
        this.connection = this.peer!.connect(senderCode);

        this.connection.on('open', () => {
          this.statusCallback({
            status: 'connected',
            message: 'Connected! Waiting for data...'
          });
        });

        this.connection.on('data', (data: string) => {
          this.receiveData(data);
        });

        this.connection.on('error', (err: any) => {
          this.statusCallback({
            status: 'error',
            message: 'Connection failed',
            error: err.message
          });
        });
      });

      this.peer.on('error', (err) => {
        this.statusCallback({
          status: 'error',
          message: 'Failed to connect',
          error: err.message
        });
      });

    } catch (error: any) {
      this.statusCallback({
        status: 'error',
        message: 'Failed to initialize connection',
        error: error.message
      });
    }
  }

  // Send database data
  private async sendData(): Promise<void> {
    if (!this.connection) return;

    try {
      this.statusCallback({
        status: 'sending',
        message: 'Exporting data...'
      });

      // Export database data
      const dbNames = ['ResuMateMain', 'svelte-persist'];
      const exportContent: any = {};

      for (const dbName of dbNames) {
        const rawDB = await this.openDB(dbName);
        exportContent[dbName] = {};

        for (const storeName of rawDB.objectStoreNames) {
          const transaction = rawDB.transaction(storeName, 'readonly');
          const store = transaction.objectStore(storeName);
          const data: { key: any; value: any }[] = [];

          await new Promise<void>((resolve, reject) => {
            const cursorRequest = store.openCursor();
            cursorRequest.onerror = () => reject(cursorRequest.error);
            cursorRequest.onsuccess = (e: any) => {
              const cursor = e.target.result;
              if (cursor) {
                data.push({ key: cursor.key, value: cursor.value });
                cursor.continue();
              } else {
                resolve();
              }
            };
          });
          exportContent[dbName][storeName] = data;
        }
        rawDB.close();
      }

      this.statusCallback({
        status: 'sending',
        message: 'Sending data to receiver...'
      });

      const jsonString = JSON.stringify(exportContent);
      this.connection.send(jsonString);

      this.statusCallback({
        status: 'complete',
        message: 'Data sent successfully!'
      });

    } catch (error: any) {
      this.statusCallback({
        status: 'error',
        message: 'Failed to send data',
        error: error.message
      });
    }
  }

  // Receive and import data
  private async receiveData(jsonString: string): Promise<void> {
    try {
      this.statusCallback({
        status: 'receiving',
        message: 'Receiving and importing data...'
      });

      await importIndexedDBs(jsonString);

      this.statusCallback({
        status: 'complete',
        message: 'Data received and imported successfully!'
      });

    } catch (error: any) {
      this.statusCallback({
        status: 'error',
        message: 'Failed to import data',
        error: error.message
      });
    }
  }

  // Helper to open IndexedDB
  private openDB(name: string): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(name);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // Clean up connections
  cleanup(): void {
    if (this.connection) {
      try { this.connection.close(); } catch {}
    }
    if (this.peer) {
      try { this.peer.destroy(); } catch {}
    }
    this.peer = null;
    this.connection = null;
  }
}