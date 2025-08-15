# ResuMate 📃

A smart resume builder for developers that helps you tailor resumes to specific job postings.

🌐 **[Try it now](https://shlok-bhakta.github.io/ResuMate/)** - Runs entirely in your browser, no data leaves your device!

![ResuMate App Overview](image-placeholder-app-overview.png)
*Modern glassmorphism UI with real-time resume editing and keyword scoring*

## Features

- **AI-powered resume tuning** - Automatically adapt your resume to job descriptions
- **Smart keyword matching** - See how well your resume matches job requirements  
- **Real-time preview** - Watch your resume update as you edit
- **Data sync** - Transfer data between devices securely
- **Export to PDF** - Professional formatting ready for applications

![Feature Showcase](image-placeholder-features.png)
*AI tuning, keyword scoring, and PDF export in action*

## Quick Start

1. **Setup** - Add your basic info and optionally connect an OpenRouter AI key
   
   ![Settings Panel](image-placeholder-settings.png)
   *Clean tabbed settings with profile info and AI configuration*

2. **Create Project** - Start a new resume project with a descriptive name
   
   ![Project Creation](image-placeholder-new-project.png)
   *Simple project creation with glassmorphism modals*

3. **Add Content** - Write your resume in markdown with job description
   
   ![Content Editor](image-placeholder-editor.png)
   *Split-pane editor with markdown on left, job description on right*

4. **Tune & Score** - See keyword matches and use AI to optimize content
   
   ![Keyword Scoring](image-placeholder-scoring.png)
   *Real-time keyword analysis with visual score indicators*

5. **Export** - Download as PDF when ready
   
   ![PDF Preview](image-placeholder-preview.png)
   *Professional PDF formatting with perfect print layout*

## Key Tips

- Use `||` in markdown to split left/right aligned content: `**Company** - Location || Date`
- Use `Alt + /` to quickly comment/uncomment lines
- Higher scores mean better keyword matching with job descriptions
- AI tuning requires an OpenRouter API key (optional but recommended)

## Need Help?

The app includes detailed help within the settings panel, or check the [full documentation](https://github.com/Shlok-Bhakta/ResuMate) for screenshots and step-by-step guides.

---

Built with ❤️ using Svelte • [Report issues](https://github.com/Shlok-Bhakta/ResuMate/issues) • [Contribute](https://github.com/Shlok-Bhakta/ResuMate/pulls)

## Setup
Hit the settings button in the bottom left of the screen

### Basic Info
Enter all your info. The slider determine wether it will be on the document
![image](https://github.com/user-attachments/assets/e065c852-6745-485e-916f-b874ed8b0856)


### Setup OpenRouter Integration (Optional)
This application has optional AI integration that will help you tune your resume using your own api key.
![image](https://github.com/user-attachments/assets/30ed2f15-dcd4-457b-a3b8-c6566dc01aae)

First go to [https://openrouter.ai/](https://openrouter.ai/)
Then make an account
Add credit onto the platform to use paid models like chatgpt or gemini or use the free models by typing "free" into the search box.
![image](https://github.com/user-attachments/assets/8c8def11-1382-4a0d-85a5-6c5fd05ef90a)

### Content
Click both of the fetch buttons to fetch my default resume info and start filling it out!
![image](https://github.com/user-attachments/assets/c224c4d7-2bf5-4d9a-a926-8d2fb9046833)

This editor uses markdown because it is easy to read and it can be made into documents easily

I have added 1 special thing to this markdown though
```md
**Texas A&M University** - College Station, TX || 05/2026 
```
The || is a split. This means all the stuff to the left of the || is left alligned and all the stuff to the right of the || is right alligned

The markdown editor has a pretty handy feature where you can do `ALT + /` on any selected lines and it will comment them out quicky including and excluding them from the reusme

Next is the knowlege bank. Here is the content you will be giving the AI for tuning. Anything that is not in the resume could be good to have. Some voulenteer or military experience that is not in the content of the resume is good to have. Also having deep descriptions with tons of numbers and data that the AI can use to make a better taylored resume could also be nice.

## Usage
Step one is hitting the new project button 

![image](https://github.com/user-attachments/assets/bdf4b28e-3b91-4215-96b3-784c966aa6e6)

You should now see somehting like 

![image](https://github.com/user-attachments/assets/7fdac771-0760-49cf-9c73-c1ce7f15269e)

Step 1 is naming the project. Give it a name that describes the resume

![image](https://github.com/user-attachments/assets/1edc2163-7b4a-4495-8a01-33502e2af2d7)

Once you have named it, hit the save button.
and you should see the light turn green and the project be added to the sidebar

## Send/Receive (PeerJS Transfer)

You can transfer all your resume data between browsers or devices using the **Send/Receive** feature, powered by PeerJS and IndexedDB. This is useful for moving your data to a new device or sharing with someone you trust.

### How It Works

- **All data on the receiver will be replaced** with the sender's data.
- The transfer happens directly between browsers—no data is sent to any server.

### Requirements

- Both sender and receiver must use a browser that supports IndexedDB and PeerJS (most modern browsers).
- Internet connection is required for PeerJS signaling.

### Steps

#### Sender

1. Open the app and go to the settings.
2. Click "Send Data".
3. A code will be generated—share this code with the receiver.

#### Receiver

1. Open the app and go to the settings.
2. Click "Receive Data".
3. Enter the code provided by the sender.
4. Confirm to replace all your current data with the sender's data.

**Note:** This will overwrite all your existing resume data on the receiving device.

![image](https://github.com/user-attachments/assets/f89e8a5d-e826-4e04-8091-228288c2db71)

Changing the name will also update it in the sidebar

![image](https://github.com/user-attachments/assets/efa54918-e63e-4eb6-8a60-44c62d49582d)

Next go and get the job description and paste it into the other box. You can try pasting a link and using that but it is not gaurenteed to work. In my image I had to manually copy and paste it since they have some server side stuff going on.

![image](https://github.com/user-attachments/assets/61d029e3-1f02-4a5d-aa3b-51f17c88bd52)

Step two is heading to the tuning tab

![image](https://github.com/user-attachments/assets/6a2dbc0b-57d9-45e6-b942-fd9488922028)

Here you will see a score given to your resume as well as some keywords you may want to try to match.

If you think some keywords are bogus or want some custom ones on there then head to the settings editor and scroll down

![image](https://github.com/user-attachments/assets/bd8041db-7b87-40e1-bbf6-c3349452e764)

Here you can delete or add keywords of your chosing!
![image](https://github.com/user-attachments/assets/f05dfb4d-febb-445a-9640-3cf5800f535b)

After typing in your resume to rescore it, You should see that your selections are in there
![image](https://github.com/user-attachments/assets/d20dda17-6407-456f-ae0e-077bb1fd271c)

Now if you setup the AI tuning earlier you can hit tune resume and it will pass it off to the AI of choise and modify the resume. Once its done you can see the changes instantly. If you do not like it feel free to hit the reset button next to the title to go back to the original template. 


![image](https://github.com/user-attachments/assets/c3481700-4ee7-477e-8edf-95994f095eca)

Next is the preview
![image](https://github.com/user-attachments/assets/da98b20c-b6a5-40dc-8bc1-30a31a1e9232)

Nothing much to do here. Just take a look at the resume and make sure its not leaking off of the page.

Finally hit download

![image](https://github.com/user-attachments/assets/9d08d54a-6735-4e49-83d8-44430e8a03a1)

Once you press it, the browser will open a new tab with print options. Make sure that your resume fits the page and print to pdf.

And you are done! Good luck on the job hunt!

You can then make a new project and come back to this one anytime from the sidebar.

## Other things
The applicaiton has a reset option in the settings, this will delete everything!

The application has a download and upload data button. This lets you move the data from one computer to another or share all your data to a friend (note this will also share your api key so just be aware of that. 



Any PRs and issues are greatly appreciated!
Built with ❤️ Using Svelte
