# load the tags.json file
import json
import openai

data = []

# load the tags.json file
with open('tags.json', 'r') as f:
    for line in f:
        if "name" in line:
            # append only the content after the : to the data list
            linedata = line.split(':')[1].strip()
            # remoge the ""
            linedata = linedata.replace('"', '')
            # add the data to the list
            data.append(linedata)


# if there is a case where there are - in the keywords then turn the - into a space and add it again to the list
for i in range(len(data)):
    if "-" in data[i]:
        # data.append(data[i].replace("-", " "))
        data[i] = data[i].replace("-", " ")


# sort all data by length highest to lowest
data.sort(key=len, reverse=True)


# remove duplicates
original_length = len(data)
data = list(dict.fromkeys(data))  # Using dict.fromkeys preserves order
dupecount = original_length - len(data)

print(f"removed {dupecount} duplicates")

# somwhow see if the words are techy enough to add?
# call the google gemini api trhough openrouter and get the data
# setup opanai client
from openai import OpenAI

client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key="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",
)

cleanwords = []
fcl = open('cleanwords.txt', 'w')
# go over all words in 100 word chunks
for i in range(0, len(data), 100):
    # get the words
    words = data[i:i+100]
    completion = client.chat.completions.create(
    model="google/gemini-2.0-flash-001",
    messages=[
        {
        "role": "user",
        "content": f"""
        you are a tool that turns complex tech words into simpler words.
        these will be used to scan job descriptions for relevant keywords.

        for example turn the keyword
        
        angular reactive forms
        selenium chromedriver

        
        into 

        angular
        reactive forms
        selenium

        these are likely to be on a job description

        another exmample

        google text to speech
        google plugin eclipse
        entity framework core
        azure mobile services
        internal server error

        into nothing because these are way too niche.

        these have to be words that could be on a general job description

        your ouptut will have nothing in it except the words

        do not say stuff like "certainly" or ``` for block quotes. skip anything that can break the tool. only output the words!
        do not write any descriptions. only output the words. so no Janus (time-reversible computing programming language) only output Janus
        
        Here are the words: 
        {words} 

        """
        }
    ]
    )

    print(completion.choices[0].message.content)
    fcl.write(completion.choices[0].message.content)
    fcl.write('\n')


fcl.close()


# write data to a file seperated by a new line
f2 = open('keywords.txt', 'w')
f2.write('\n'.join(data))
f2.close()