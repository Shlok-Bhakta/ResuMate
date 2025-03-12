f = open('cleanwords.txt', 'r')
data = f.read()
f.close()

data = data.split('\n')
# remove empty lines
data = [x for x in data if x]

# add every single programming language to the list
langf = open('programming-languages.csv', 'r')
langs = []
for line in langf:
    langs.append(line.split(',')[0])
langf.close()

# add some other langs
langs += ["nix", "gleam"]

data = data + langs


# remove duplicate lines
original_length = len(data)
data = list(dict.fromkeys(data))  # Using dict.fromkeys preserves order
dupecount = original_length - len(data)




print(f"removed {dupecount} duplicates")



# sort all data by length highest to lowest
data.sort(key=len, reverse=True)


# write data to a file seperated by a new line
f2 = open('cleaned.txt', 'w')
f2.write('\n'.join(data))
f2.close()