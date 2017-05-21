# -*- coding: utf-8 -*-
from django.db import models
from datetime import *
from django import forms

#КАТЕГОРИИ
class Category(models.Model):
    name = models.CharField(max_length=255, verbose_name='Название категории')
    alias = models.SlugField(verbose_name='Alias категории')

    class Meta:
        verbose_name = "Категория"
        verbose_name_plural = "Категории"
    def __str__(self):
        return "Категория %s" % self.name

#ТОВАРЫ
class Item(models.Model):
    name = models.CharField(max_length=255, verbose_name='Название товара')
    price = models.IntegerField(default=0, verbose_name='Цена')
    image = models.CharField(max_length=255, verbose_name='Ссылка на картинку')
    discount = models.SmallIntegerField(default=0, verbose_name='Скидка')
    description = models.TextField(verbose_name='Описание')
    data = models.DateTimeField()
    number = models.IntegerField(default=0, verbose_name='Общее количество товара')
    sales = models.SmallIntegerField(default=0, verbose_name='Продан или нет товар')
    category = models.ForeignKey(Category)

    class Meta:
        verbose_name = "Товар"
        verbose_name_plural = "Товары"

    def __str__(self):
        return "Товар %s" % self.name

#ВСЁ ПО ПАРАМЕТРАМ ОБУВИ
class Size(models.Model):
    name = models.SmallIntegerField(verbose_name='Размер')

    class Meta:
        verbose_name = "Размеры обуви"
        verbose_name_plural = "Размеры обуви"

    def __str__(self):
        return "Размер %s" % self.name

class TypeObuv(models.Model):
    name = models.CharField(max_length=255, verbose_name='Тип обуви')

    class Meta:
        verbose_name = "Типы обуви"
        verbose_name_plural = "Типы обуви"

    def __str__(self):
        return "Тип обуви %s" % self.name

class BrendObuv(models.Model):
    name = models.CharField(max_length=255, verbose_name='Бренд обуви')

    class Meta:
        verbose_name = "Бренды обуви"
        verbose_name_plural = "Бренды обуви"

    def __str__(self):
        return "Бренд обуви %s" % self.name
#наличие определённых размеров
class StoreObuv(models.Model):
    item = models.ForeignKey(Item)
    size = models.ForeignKey(Size)
    number = models.SmallIntegerField(verbose_name='Количество', default=1)

    class Meta:
        verbose_name = "Склад обуви"
        verbose_name_plural = "Склад обуви"

    def __str__(self):
        return self.item.name

class OptionsObuv(models.Model):
    item = models.ForeignKey(Item)
    type = models.ForeignKey(TypeObuv)
    brend = models.ForeignKey(BrendObuv)

#ВСЁ ПО ПАРАМЕТРАМ СУМОК
class TypeSumki(models.Model):
    name = models.CharField(max_length=255, verbose_name='Тип сумки')

    class Meta:
        verbose_name = "Типы сумок"
        verbose_name_plural = "Типы сумок"

    def __str__(self):
        return self.name

class BrendSumki(models.Model):
    name = models.CharField(max_length=255, verbose_name='Бренд сумок')

    class Meta:
        verbose_name = "Бренды сумок"
        verbose_name_plural = "Бренды сумок"

    def __str__(self):
        return self.name

class OptionsSumki(models.Model):
    item = models.ForeignKey(Item)
    type = models.ForeignKey(TypeSumki)
    brend = models.ForeignKey(BrendSumki)

#ПРОЧИК МОДЕЛИ
class MainOffer(models.Model):
    image = models.CharField(max_length=255, verbose_name='Ссылка на картинку')
    color = models.CharField(max_length=255, verbose_name='Цвет фона')
    link = models.CharField(max_length=255, verbose_name='Ссылка на каталог с параметрами')

    class Meta:
        verbose_name = "Специальные предложения"
        verbose_name_plural = "Специальные предложения"

class NumberViews(models.Model):
    item = models.ForeignKey(Item)
    number = models.SmallIntegerField(verbose_name='Количество просмотров')
    data = models.DateTimeField(verbose_name='Дата последнего просмотра')

    class Meta:
        verbose_name = "Количество просмотров по товарам"
        verbose_name_plural = "Количество просмотров по товарам"

# ВСЁ ПО ЗАКАЗАМ
class OrderForm(forms.Form):
    citis = (
        ("Нижний Новгород", "Нижний Новгород"),
        ("Москва", "Москва"),
        ("Екатеринбург", "Екатеринбург")
    )
    name = forms.CharField(
        max_length=100, widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Введите имя'}))
    surname = forms.CharField(
        max_length=100, widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Введите фамилию'}))
    fon_number = forms.CharField(
        max_length=100,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Введите номер телефона'}))
    city = forms.ChoiceField(
        widget=forms.Select(attrs={'class': 'form-control', 'placeholder': 'Выберите город доставки'}), choices=citis)
    adress = forms.CharField(
        max_length=200,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Введите адрес доставки'}))


# данные о покупателе товара и месте доставки(тут ID заказа)
class Order_params(models.Model):
    name = models.CharField(max_length=255, verbose_name='Имя покупателя')
    surname = models.CharField(max_length=255, verbose_name='Фамилия покупателя')
    adress = models.CharField(max_length=255, verbose_name='Адрес доставки', default='Самовывоз')
    data = models.DateTimeField()


    def __str__(self):
        return self.name+" "+self.surname


# товары в заказе
class Order_items(models.Model):
    item = models.ForeignKey(Item)
    order = models.ForeignKey(Order_params)
    number = models.SmallIntegerField(verbose_name="Количетсво товара", default=1)


#выбранный размер обуви
class Order_size_obuv(models.Model):
    order = models.ForeignKey(Order_params)
    item = models.ForeignKey(Item)
    size = models.ForeignKey(Size, default=1)




