# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2016-12-27 21:35
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('sumki_online', '0004_auto_20161227_2008'),
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, verbose_name='Название категории')),
                ('alias', models.SlugField(verbose_name='Alias категории')),
            ],
            options={
                'verbose_name': 'Категория',
                'verbose_name_plural': 'Категории',
            },
        ),
        migrations.CreateModel(
            name='Item',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, verbose_name='Название товара')),
                ('price', models.IntegerField(default=0, verbose_name='Цена')),
                ('image', models.CharField(max_length=255, verbose_name='Ссылка на картинку')),
                ('alias', models.SlugField(verbose_name='Alias товара')),
                ('discount', models.SmallIntegerField(default=0, verbose_name='Скидка')),
                ('description', models.TextField(verbose_name='Описание')),
                ('number', models.SmallIntegerField(verbose_name='Количество')),
                ('data', models.DateTimeField()),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='sumki_online.Category')),
            ],
            options={
                'verbose_name': 'Товар',
                'verbose_name_plural': 'Товары',
            },
        ),
        migrations.CreateModel(
            name='Size',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.SmallIntegerField(verbose_name='Размер')),
            ],
        ),
        migrations.AddField(
            model_name='item',
            name='size',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='sumki_online.Size'),
        ),
    ]
