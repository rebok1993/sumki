from django.core.management.base import BaseCommand, CommandError
from sumki_online.models import *
from django.utils import timezone
import random

class Command(BaseCommand):
    def add_arguments(self, parser):
        # Named (optional) arguments
        parser.add_argument('--start',
                            action='store',
                            dest='start',
                            default=0,
                            help='Start',
                            type=int)
        parser.add_argument('--end',
                            action='store',
                            dest='end',
                            default=20,
                            help='End',
                            type=int)
        parser.add_argument('--clear',
                            action='store_true',
                            dest='clear',
                            default=False,
                            help='Clear')

    def handle(self, *args, **options):
        start = 0
        end = 100
        clear = False
        for key in options:
            if key=='start':
                start=options[key]
            elif key=='end':
                end = options[key]
            elif key=='clear':
                clear = options[key]

        items = Item.objects.all()
        numbers = NumberViews.objects.filter(item__in=items)
        item_num = [value['id'] for value in numbers.values()]

        for item_el in items:
            num = random.randint(start, end)
            if item_el.id not in item_num:
                number_new = NumberViews(item=item_el, number=num, number_week=num, data=timezone.now())
                number_new.save()

        for number in numbers:
            num = random.randint(start, end)
            number.number_week += num
            if clear: number.number_week = num
            number.save()