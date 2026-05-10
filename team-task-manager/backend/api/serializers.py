from rest_framework import serializers
from .models import Task, Project
from django.contrib.auth.models import User

# 👤 User Serializer (optional)
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']


# 📁 Project Serializer
class ProjectSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Project
        fields = '__all__'


# ✅ Task Serializer (IMPORTANT PART)
class TaskSerializer(serializers.ModelSerializer):
    assigned_to_username = serializers.CharField(source='assigned_to.username', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)

    class Meta:
        model = Task
        fields = '__all__'