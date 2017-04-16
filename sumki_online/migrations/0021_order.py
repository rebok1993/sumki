# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2017-01-19 11:37
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('sumki_online', '0020_auto_20170115_1641'),
    ]

    operations = [
        migrations.CreateModel(
            name='Order',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, verbose_name='Имя покупателя')),
                ('surname', models.CharField(max_length=255, verbose_name='Фамилия покупателя')),
                ('adress', models.CharField(default='Самовывоз', max_length=255, verbose_name='Адрес доставки')),
                ('data', models.DateTimeField()),
                ('item', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='sumki_online.Item')),
            ],
        ),
    ]
