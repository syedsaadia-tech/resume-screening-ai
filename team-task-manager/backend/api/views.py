from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Project, Task


# 🔐 LOGIN
@api_view(['POST'])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"error": "Invalid username"}, status=400)

    if not user.check_password(password):
        return Response({"error": "Invalid password"}, status=400)

    refresh = RefreshToken.for_user(user)

    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh)
    })


# 🆕 SIGNUP
@api_view(['POST'])
def signup(request):
    username = request.data.get('username')
    password = request.data.get('password')
    role = request.data.get('role')

    if User.objects.filter(username=username).exists():
        return Response({"error": "User already exists"}, status=400)

    user = User.objects.create_user(username=username, password=password)

    profile = user.userprofile
    profile.role = role
    profile.save()

    return Response({"message": "User created successfully"})


# 📁 GET PROJECTS
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_projects(request):
    projects = Project.objects.all()

    data = []
    for p in projects:
        data.append({
            "id": p.id,
            "name": p.name,
            "description": p.description
        })

    return Response(data)


# ➕ CREATE PROJECT
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_project(request):
    project = Project.objects.create(
        name=request.data.get('name'),
        description=request.data.get('description'),
        created_by=request.user
    )

    return Response({
        "id": project.id,
        "name": project.name,
        "description": project.description
    })


# ✅ CREATE TASK
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_task(request):
    project_id = request.data.get('project_id')
    assigned_to_id = request.data.get('assigned_to')

    task = Task.objects.create(
        title=request.data.get('title'),
        description=request.data.get('description'),
        status=request.data.get('status'),
        due_date=request.data.get('due_date'),
        project=Project.objects.get(id=project_id),
        assigned_to=User.objects.get(id=assigned_to_id)
    )

    return Response({
        "id": task.id,
        "title": task.title,
        "status": task.status
    })


# 📋 GET TASKS
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_tasks(request):
    tasks = Task.objects.all()

    data = []
    for t in tasks:
        data.append({
            "id": t.id,
            "title": t.title,
            "status": t.status,
            "due_date": str(t.due_date),
            "project": t.project.name,
            "assigned_to": t.assigned_to.username
        })

    return Response(data)