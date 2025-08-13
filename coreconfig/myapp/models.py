# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class Certified(models.Model):
    cid = models.AutoField(db_column='CID', primary_key=True)  # Field name made lowercase.
    ctitle = models.TextField(db_column='CTitle', db_collation='Chinese_Taiwan_Stroke_CI_AS', blank=True, null=True)  # Field name made lowercase.
    credatetime = models.DateTimeField(db_column='CreDateTime')  # Field name made lowercase.
    upddatetime = models.DateTimeField(db_column='UpdDateTime', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Certified'
        
    def __str__(self):
        return f"{self.ctitle} (CID:{self.cid})"


class Questioncertified(models.Model):
    qcertid = models.AutoField(db_column='QCertID', primary_key=True)  # Field name made lowercase.
    cid = models.ForeignKey(Certified, models.DO_NOTHING, db_column='CID')  # Field name made lowercase.
    qhid = models.ForeignKey('Questionheader', models.DO_NOTHING, db_column='QHID')  # Field name made lowercase.
    credatetime = models.DateTimeField(db_column='CreDateTime')  # Field name made lowercase.
    upddatetime = models.DateTimeField(db_column='UpdDateTime', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'QuestionCertified'
    


class Questionchoose(models.Model):
    qcid = models.AutoField(db_column='QCID', primary_key=True)  # Field name made lowercase.
    qhid = models.ForeignKey('Questionheader', models.DO_NOTHING, db_column='QHID')  # Field name made lowercase.
    qctitle = models.TextField(db_column='QCTitle', db_collation='Chinese_Taiwan_Stroke_CI_AS', blank=True, null=True)  # Field name made lowercase.
    iscorrect = models.BooleanField(db_column='IsCorrect', blank=True, null=True)  # Field name made lowercase.
    credatetime = models.DateTimeField(db_column='CreDateTime')  # Field name made lowercase.
    upddatetime = models.DateTimeField(db_column='UpdDateTime', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'QuestionChoose'


class Questionevent(models.Model):
    qeid = models.AutoField(db_column='QEID', primary_key=True)  # Field name made lowercase.
    qhid = models.ForeignKey('Questionheader', models.DO_NOTHING, db_column='QHID')  # Field name made lowercase.
    iscorrect = models.BooleanField(db_column='IsCorrect', blank=True, null=True)  # Field name made lowercase.
    credatetime = models.DateTimeField(db_column='CreDateTime')  # Field name made lowercase.
    upddatetime = models.DateTimeField(db_column='UpdDateTime', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'QuestionEvent'


class Questionheader(models.Model):
    qhid = models.AutoField(db_column='QHID', primary_key=True)  # Field name made lowercase.
    qhtitle = models.TextField(db_column='QHTitle', db_collation='Chinese_Taiwan_Stroke_CI_AS', blank=True, null=True)  # Field name made lowercase.
    qhmultiple = models.BooleanField(db_column='QHMultiple', blank=True, null=True)  # Field name made lowercase.
    explain = models.TextField(db_column='Explain', db_collation='Chinese_Taiwan_Stroke_CI_AS', blank=True, null=True)  # Field name made lowercase.
    isdone = models.BooleanField(db_column='IsDone', blank=True, null=True)  # Field name made lowercase.
    iscorrect = models.BooleanField(db_column='IsCorrect', blank=True, null=True)  # Field name made lowercase.
    istag = models.BooleanField(db_column='IsTag', blank=True, null=True)  # Field name made lowercase.
    credatetime = models.DateTimeField(db_column='CreDateTime')  # Field name made lowercase.
    upddatetime = models.DateTimeField(db_column='UpdDateTime', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'QuestionHeader'


class Questionrecord(models.Model):
    qrid = models.AutoField(db_column='QRID', primary_key=True)  # Field name made lowercase.
    qcid = models.ForeignKey(Questionchoose, models.DO_NOTHING, db_column='QCID')  # Field name made lowercase.
    qeid = models.ForeignKey(Questionevent, models.DO_NOTHING, db_column='QEID')  # Field name made lowercase.
    credatetime = models.DateTimeField(db_column='CreDateTime')  # Field name made lowercase.
    upddatetime = models.DateTimeField(db_column='UpdDateTime', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'QuestionRecord'


class Questiontag(models.Model):
    qtagid = models.AutoField(db_column='QTagID', primary_key=True)  # Field name made lowercase.
    thid = models.ForeignKey('Tagheader', models.DO_NOTHING, db_column='THID')  # Field name made lowercase.
    qhid = models.ForeignKey(Questionheader, models.DO_NOTHING, db_column='QHID')  # Field name made lowercase.
    credatetime = models.DateTimeField(db_column='CreDateTime')  # Field name made lowercase.
    upddatetime = models.DateTimeField(db_column='UpdDateTime', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'QuestionTag'


class Tagheader(models.Model):
    thid = models.AutoField(db_column='THID', primary_key=True)  # Field name made lowercase.
    tagtitle = models.TextField(db_column='TagTitle', db_collation='Chinese_Taiwan_Stroke_CI_AS', blank=True, null=True)  # Field name made lowercase.
    credatetime = models.DateTimeField(db_column='CreDateTime')  # Field name made lowercase.
    upddatetime = models.DateTimeField(db_column='UpdDateTime', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'TagHeader'
    def __str__(self):
        return f"{self.tagtitle} (THID:{self.thid })"
