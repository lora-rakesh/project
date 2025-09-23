from django.contrib.auth.management.commands.createsuperuser import Command as BaseCommand

class Command(BaseCommand):
    def get_input_data(self, field_name, message, default=None):
        value = super().get_input_data(field_name, message, default)
        if field_name == "role" and value:
            value = value.lower()  # normalize role input
        return value
