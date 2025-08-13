# myapp/forms.py
from django import forms

class QuestionheaderSearchForm(forms.Form):
    qhid = forms.IntegerField(required=False, label='QHID')
    iscorrect = forms.ChoiceField(
        choices=[('', 'All'), ('1', '✅ True'), ('0', '❌ False')],
        required=False, label='IsCorrect'
    )
    istag = forms.ChoiceField(
        choices=[('', 'All'), ('1', '✅ True'), ('0', '❌ False')],
        required=False, label='IsTag'
    )
    isdone = forms.ChoiceField(
        choices=[('', 'All'), ('1', '✅ True'), ('0', '❌ False')],
        required=False, label='IsDone'
    )
