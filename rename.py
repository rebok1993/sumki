import os
path = "sumki_online/static/sumki_online/images/sumki/"
directs = ["64_on_64", "100_on_100", "200_on_200", "400_on_400", "main"]

for i in directs:
    files = os.listdir(path+i)
    for file in files:
        new_file = file.lower()
        os.rename(path+i+"/"+file, path+i+"/"+new_file)