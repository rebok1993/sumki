# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2017-01-01 15:31
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('sumki_online', '0017_auto_20170101_1830'),
    ]

    operations = [
        migrations.CreateModel(
            name='BrendObuv',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, verbose_name='Бренд обуви')),
            ],
        ),
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, verbose_name='Название категории')),
                ('alias', models.SlugField(verbose_name='Alias категории')),
            ],
            options={
                'verbose_name_plural': 'Категории',
                'verbose_name': 'Категория',
            },
        ),
        migrations.CreateModel(
            name='Item',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, verbose_name='Название товара')),
                ('price', models.IntegerField(default=0, verbose_name='Цена')),
                ('image', models.CharField(max_length=255, verbose_name='Ссылка на картинку')),
                ('discount', models.SmallIntegerField(default=0, verbose_name='Скидка')),
                ('description', models.TextField(verbose_name='Описание')),
                ('data', models.DateTimeField()),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='sumki_online.Category')),
            ],
            options={
                'verbose_name_plural': 'Товары',
                'verbose_name': 'Товар',
            },
        ),
        migrations.CreateModel(
            name='OptionsObuv',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('number', models.SmallIntegerField(verbose_name='Количество')),
                ('brend', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='sumki_online.BrendObuv')),
                ('item', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='sumki_online.Item')),
            ],
        ),
        migrations.CreateModel(
            name='Size',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.SmallIntegerField(verbose_name='Размер')),
            ],
        ),
        migrations.CreateModel(
            name='TypeObuv',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, verbose_name='Тип обуви')),
            ],
        ),
        migrations.AddField(
            model_name='optionsobuv',
            name='size',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='sumki_online.Size'),
        ),
        migrations.AddField(
            model_name='optionsobuv',
            name='type',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='sumki_online.TypeObuv'),
        ),
    ]
