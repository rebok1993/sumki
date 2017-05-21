# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2017-01-23 16:23
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('sumki_online', '0024_mainoffer'),
    ]

    operations = [
        migrations.CreateModel(
            name='NumberViews',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('number', models.SmallIntegerField(verbose_name='Количество просмотров')),
                ('data', models.DateTimeField(verbose_name='Дата последнего просмотра')),
                ('item', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='sumki_online.Item')),
            ],
        ),
    ]