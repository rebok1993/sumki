# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2016-12-20 20:51
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sumki_online', '0002_auto_20161220_2339'),
    ]

    operations = [
        migrations.AddField(
            model_name='item',
            name='alias',
            field=models.SlugField(default='no', verbose_name='Alias товара'),
        ),
    ]
