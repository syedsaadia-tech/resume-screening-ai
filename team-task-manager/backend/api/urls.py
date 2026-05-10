from django.urls import path
from .views import (
    login, signup,
    get_projects, create_project,
    create_task, get_tasks
)

urlpatterns = [
    path('signup/', signup),
    path('login/', login),

    path('projects/', get_projects),
    path('create-project/', create_project),

    path('tasks/', get_tasks),
    path('create-task/', create_task),
]