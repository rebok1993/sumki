import os
path = "sumki_online/static/sumki_online/images/sumki/"
direc = "64_on_64"
direc2 = "100_on_100"
direc3 = "200_on_200"
direc4 = "400_on_400"
direc5 = "main"
files = os.listdir(path)

for file in files:
    new_file = file.lower()
    os.rename(path+direc+"/"+file, path+direc+"/"+new_file)
    os.rename(path+direc2+"/"+file, path+direc+"/"+new_file)
    os.rename(path+direc3+"/"+file, path+direc+"/"+new_file)
    os.rename(path+direc4+"/"+file, path+direc+"/"+new_file)
    os.rename(path+direc5+"/"+file, path+direc+"/"+new_file)