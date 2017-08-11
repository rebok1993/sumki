from PIL import Image
import os

files = os.listdir("sumki_online/static/sumki_online/images/sumki/400_on_400")

for file in files:
    image_big = Image.open("sumki_online/static/sumki_online/images/sumki/400_on_400/"+file)
    new_image = image_big.resize((200,200), Image.ANTIALIAS)
    new_image.save("sumki_online/static/sumki_online/images/sumki/200_on_200/"+file)

