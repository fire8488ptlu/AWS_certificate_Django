# Django Part

---

### exe command

```
python manage.py runserver 8005
python manage.py createsuperuser
```

### init command

```
# init
django-admin startproject coreconfig

# create adminapp
python manage.py startapp adminapp

# create myapp
python manage.py startapp myapp

```

### custom file import makesure when start can connect to DB and run init.sql

```
1. load db_utils.py
2. load env file
3. load init.sql
4. custom manage.py

```

## edit coreconfig `settings.py`

```
#### load env
from dotenv import load_dotenv
load_dotenv()

#### edit custom SECRET_KEY
SECRET_KEY = os.getenv('SECRET_KEY')

#### edit debug
DEBUG = os.getenv('DEBUG', 'False') == 'True'

#### edit DB connect to MSSQL
DATABASES = {
    'default': {
        'ENGINE': 'mssql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT'),
        'OPTIONS': {
            'driver': 'ODBC Driver 17 for SQL Server',
        },
    }
}

#### ALLOWED_HOSTS (ONLY IN DEV mode!!!)
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
CORS_ALLOW_ALL_ORIGINS = os.getenv("MODE", "prod").lower() == "dev"
CSRF_TRUSTED_ORIGINS = [
    o.strip() for o in os.getenv("CSRF_TRUSTED_ORIGINS", "").split(",") if o.strip()
]

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True


#### REST_FRAMEWORK AND JWT Setting
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),  # 🔁 Set access token to 1 day
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7), # (optional) Refresh token
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': os.getenv('JWT_SIGNING_KEY'),  # 🔐 Your own secret
    'AUTH_HEADER_TYPES': ('Bearer',),
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',  # default for all views unless overridden
    )
}





#### INSTALLED_APPS setting
#add
[
    'corsheaders',
    'adminapp',
    'rest_framework',
    'rest_framework_simplejwt',
    'myapp'
]

#### MIDDLEWARE
# add [
    'corsheaders.middleware.CorsMiddleware',  # 👈 Must be at the top
    'whitenoise.middleware.WhiteNoiseMiddleware', # After SecurityMiddleware
]

#### SET Frontend STATIC PATH
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'myapp', 'build', 'static'),
]

STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')  # for collectstatic

```

## `adminapp` custom models

```
python manage.py inspectdb auth_group auth_group_permissions auth_permission auth_user auth_user_groups auth_user_user_permissions django_admin_log django_content_type django_migrations django_session --database default | Out-File -FilePath adminapp\models.py -Encoding utf8

```

### edit model return value

```
# add under classMeta:
def __str__(self):
        return f"{self.ctitle} (CID:{self.cid})"
```

---

## `myapp` custom models

```
python manage.py inspectdb Certified QuestionCertified QuestionChoose QuestionEvent QuestionHeader QuestionRecord QuestionTag TagHeader | Out-File -FilePath myapp\models.py -Encoding utf8

load admin_site.py
load APIView_Component.py
load APIView_QuestionHeader.py
load forms.py

edit admin.py (custom function load admin_site & forms)
edit views.py (add rest_framework & frontend PATH)

load `build` Folder

```

---

## coreconfig `urls.py`

```
# import myapp models and views
Custom_API, myapp-admin , api_token , frontend

# import django.contrib.admin
admin
```

---

## Package CMD

```
docker build --no-cache -t djangocertificate:latest .
docker tag djangocertificate:latest davidluclubimage.davidlu.club/djangocertificate:latest
docker push davidluclubimage.davidlu.club/djangocertificate:latest

```
