import os
path = "sumki_online/static/sumki_online/images/sumki/main"
files = os.listdir(path)

for file in files:
    new_file = file.lower()
    os.rename(path+"/"+file, path+"/"+new_file)