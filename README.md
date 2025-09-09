# ResuMate 📃

A smart resume builder for developers that helps you tailor resumes to specific job postings.

🌐 **[Try it now](https://shlok-bhakta.github.io/ResuMate/)** - Runs entirely in your browser, no data leaves your device!

<img width="1672" height="991" alt="overview" src="https://github.com/user-attachments/assets/a809405e-c60c-4392-9015-7178dcbe3a68" />

## Features

- **AI-powered resume tuning** - Automatically adapt your resume to job descriptions
- **Smart keyword matching** - See how well your resume matches job requirements  
- **Real-time preview** - Watch your resume update as you edit
- **Data sync** - Transfer data between devices securely
- **Export to PDF** - Professional formatting ready for applications

<img width="1380" height="943" alt="tune page" src="https://github.com/user-attachments/assets/54b13b76-4d2e-4e5a-9878-61f60bc10cb8" />


## Quick Start
If you are not brainrotted into oblivion, scroll down to see the full guide and the intended usage flow

1. **Setup** - Add your basic info and optionally connect an OpenRouter AI key
   
   <img width="1305" height="605" alt="settings" src="https://github.com/user-attachments/assets/506a182a-1d03-4256-9e98-31a145c13e79" />

2. **Create Project** - Start a new resume project with a descriptive name
   
   !<img width="1166" height="563" alt="project creation" src="https://github.com/user-attachments/assets/8f8778d4-b6db-43a6-aff8-2df49b081403" />

3. **Add Content** - Write your resume in markdown with job description
   
   <img width="1384" height="406" alt="markdown typing" src="https://github.com/user-attachments/assets/a1c61f63-6a2c-459e-b4e3-3b9e2d611dd6" />

4. **Tune & Score** - See keyword matches and use AI to optimize content
   
   <img width="1385" height="652" alt="tune score" src="https://github.com/user-attachments/assets/844b6b46-dda0-41f4-9a49-02e540b1801f" />

5. **Export** - Download as PDF when ready
   
   <img width="1265" height="599" alt="image" src="https://github.com/user-attachments/assets/304fafcc-ecf4-44b6-8254-d70e2ab74b01" />


## In Depth Guide. Please read for a good time using this :/
Start by hitting the settings button on the bottom left of the screen
<img width="1677" height="987" alt="go to settings" src="https://github.com/user-attachments/assets/3a4aa125-d10d-4078-a45a-9605df6f1d80" />

### Basic Info
Enter all your info. The slider will determine wether the data will be on the document
<img width="1314" height="618" alt="Add Personal info" src="https://github.com/user-attachments/assets/01b43c58-0caf-4132-aee4-e1dd3a70670b" />


### Setup OpenRouter Integration (Optional but stronly reccomended)
This application has optional AI integration that will help you tune your resume using your own api key.

<img width="1310" height="841" alt="openrouter" src="https://github.com/user-attachments/assets/9abee2d6-5864-433d-9573-d955cdd52f96" />

### Content
Click both of the fetch buttons to fetch my default resume info and start filling it out!
<img width="1297" height="900" alt="content" src="https://github.com/user-attachments/assets/3e9c2235-a7b8-4153-8960-9176aec604f2" />

This editor uses markdown because it is easy to read and it can be made into documents easily

I have added 1 special thing to this markdown though
```md
**Texas A&M University** - College Station, TX || 05/2026 
```
The || is a split. This means all the stuff to the left of the || is left alligned and all the stuff to the right of the || is right alligned

The markdown editor has a pretty handy feature where you can do `ALT + /` on any selected lines and it will comment them out quicky including and excluding them from the reusme. If it doesn't work then refresh the page I am still looking into this.

Next is the knowlege bank. Here is the content you will be giving the AI for tuning. Anything that is not in the resume could be good to have. Some voulenteer or military experience that is not in the content of the resume is good to have. Also having deep descriptions with tons of numbers and data that the AI can use to make a better taylored resume could also be nice. 

**I CANNOT STRESS ENOUGH THAT THIS IS WHERE YOU SHOULD BE SPENDING AT LEAST 2-3 HOURS. YOU NEED TO GET THIS SECTION DOWN SO THAT THE AI HAS AS MUCH INFO AS POSSIBLE!**

### Send/Receive (PeerJS Transfer)

You can transfer all your resume data between browsers or devices using the **Send/Receive** feature, powered by PeerJS and IndexedDB. This is useful for moving your data to a new device or sharing with someone you trust. This will transfer your API key for openrouter so only do this for yourself. The only reason this is a thing is because I have a desktop and a laptop. One comes to class and one stays home. So I want a way to transfer. The ideal transfer is working on my PC then transfering to my phone, then if im in class I can transfer from phone to laptop, then when done I can transfer back to phone so the phone is the 1 source of truth.

#### Requirements

- Both sender and receiver must use a browser that supports IndexedDB and PeerJS (most modern browsers).
- Internet connection is required for PeerJS signaling.
- Some networks may not work like the TAMUWIFI network :( so fall back to sending json and opening it

#### Steps

##### Sender

1. Open the app and go to the settings.
2. Click "Send Data".
3. A code will be generated—share this code with the receiver.

##### Receiver

1. Open the app and go to the settings.
2. Click "Receive Data".
3. Enter the code provided by the sender.
4. Confirm to replace all your current data with the sender's data.

**Note:** This will overwrite all your existing resume data on the receiving device.

<img width="1842" height="658" alt="transfer" src="https://github.com/user-attachments/assets/8ccc9f72-cbc9-48da-afb6-21c2a698828d" />

## Usage
Step one is hitting the new project button 

<img width="1016" height="447" alt="image" src="https://github.com/user-attachments/assets/d994d1a4-a579-4997-b787-6ef191d3c22d" />


You should now see somehting like 

<img width="534" height="487" alt="image" src="https://github.com/user-attachments/assets/8c0c6fd3-ce12-453a-976e-d4b325db25e9" />


Step 1 is naming the project. Give it a name that describes the resume

<img width="508" height="455" alt="image" src="https://github.com/user-attachments/assets/9fc9abda-ed24-4d57-8f28-73300347cd49" />


Once you have named it, hit the `Create` button.
and you should see the light turn green and the project be added to the sidebar

To change the name, url, delete, or reset to template (incase the ai goofed up) hit the edit button

<img width="796" height="805" alt="image" src="https://github.com/user-attachments/assets/05880a55-82a6-4406-9b74-02a76dec4607" />
<img width="590" height="406" alt="image" src="https://github.com/user-attachments/assets/01b662c9-e447-463f-9bea-2f2b01c58749" />



Next go and get the job description and paste it into the other box. You can try pasting a link and using that but it is not gaurenteed to work. In my image I had to manually copy and paste it since they have some server side stuff going on.

<img width="1374" height="933" alt="image" src="https://github.com/user-attachments/assets/0848550b-a388-424f-afeb-dee89802e40a" />

Step two is heading to the tuning tab

<img width="1381" height="941" alt="image" src="https://github.com/user-attachments/assets/e508aaca-29e4-4d04-afed-5d1e90cda2fa" />

Here you will see a score given to your resume as well as some keywords you may want to try to match.

If you think some keywords are bogus or want some custom ones on there then head to the settings.

Here you can delete or add keywords of your chosing!

<img width="1224" height="368" alt="image" src="https://github.com/user-attachments/assets/9cd168cc-56a5-4ca3-b5b2-a6ab99a3156b" />


After typing in your resume to rescore it, You should see that your selections are in there

<img width="989" height="361" alt="image" src="https://github.com/user-attachments/assets/e04c056d-fb9a-46d4-91fc-2c11aa089736" />

Now if you setup the AI tuning earlier you can hit tune resume and it will pass it off to the AI of choise and modify the resume. Once its done you can see the changes instantly. If you do not like it feel free to hit the reset button in the edit tab to go back to what the template has to try again

<img width="1371" height="936" alt="image" src="https://github.com/user-attachments/assets/cbae264c-5341-4564-808b-12ca6809d9c5" />
Tune with GPT-5 after 3 minutes

Next is the preview

<img width="1389" height="952" alt="image" src="https://github.com/user-attachments/assets/777879b5-6e47-4ec4-aa04-21105db709a1" />

Nothing much to do here. Just take a look at the resume and make sure its not leaking off of the page. Great place to make final tweaks

Finally hit download

<img width="1378" height="207" alt="image" src="https://github.com/user-attachments/assets/ef03afbe-a3a2-4f92-a96a-1ed3d97e5a39" />

<img width="1686" height="1019" alt="image" src="https://github.com/user-attachments/assets/8374d43e-9b78-4596-9dda-8077eb92b65e" />

Once you press it, the browser will open a new tab with print options. Make sure that your resume fits the page and print to pdf. You may have to tweak your browser print settings but it shouldn't be that annoyng. This part may be more error prone so send issues if you get any

<img width="343" height="802" alt="image" src="https://github.com/user-attachments/assets/243bf0f5-a83c-406b-887e-9ee64ecfa72f" />

And you are done! Good luck on the job hunt!

You can then make a new project and come back to this one anytime from the sidebar.


## Key Tips

- Use `||` in markdown to split left/right aligned content: `**Company** - Location || Date`
- Use `Alt + /` to quickly comment/uncomment lines. you can also select ranges of lines and comment mass blocks at once!
- Higher scores mean better keyword matching with job descriptions. Keywords are not everything though!
- AI tuning requires an OpenRouter API key. This is the real bread and butter of the app. I highly reccomend this!!!! Openrouter has free models you can use, and you definately will not be hitting rate limits with it. Just type free into the search box for models.

## Other things
The applicaiton has a reset option in the settings, this will delete everything!

The application has a download and upload data button. This lets you move the data from one computer to another or share all your data to a friend (note this will also share your api key so just be aware of that. 



## Need Help?

Welp you can create an issue but there is no gaurentee of me seing it. Now if there is something thats broken or you want to make a pr please feel free to make an issue and I will try my best to get back to you!

---

Built with ❤️ using Svelte • [Report issues](https://github.com/Shlok-Bhakta/ResuMate/issues) • [Contribute](https://github.com/Shlok-Bhakta/ResuMate/pulls)
