import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student, UserRole } from '../types';
import { db } from '../db/libraryDatabase';

interface AuthContextType {
  role: UserRole;
  currentStudent: Student | null;
  adminName: string | null;
  loginAsStudent: (studentId: string, password?: string) => { success: boolean; error?: string };
  loginAsAdmin: (adminId: string, password?: string) => { success: boolean; error?: string };
  logout: () => void;
  switchDemoStudent: (studentId: string) => void;
  refreshStudentData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'mmsc_auth_session_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('guest');
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [adminName, setAdminName] = useState<string | null>(null);

  // Restore session from localStorage if exists
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'student' && parsed.studentId) {
          const student = db.getStudent(parsed.studentId);
          if (student && student.account_status === 'Active') {
            setRole('student');
            setCurrentStudent(student);
          }
        } else if (parsed.role === 'admin') {
          setRole('admin');
          setAdminName(parsed.adminName || 'Mrs. Elena Santos, RL (Head Librarian)');
        }
      }
    } catch (e) {
      console.warn('Failed to restore auth session', e);
    }
  }, []);

  const loginAsStudent = (studentId: string, password?: string): { success: boolean; error?: string } => {
    const student = db.getStudent(studentId);
    if (!student) {
      return { success: false, error: 'Invalid Student ID or password. Please try again.' };
    }
    if (student.account_status !== 'Active') {
      return {
        success: false,
        error: 'Your student account is currently deactivated or suspended. Please contact the Delas Alas Campus Library Desk.',
      };
    }

    // Password validation (sample password: 'password123' or student's defined password)
    if (password && student.password && password !== student.password && password !== 'password123') {
      return { success: false, error: 'Invalid Student ID or password. Please try again.' };
    }

    setRole('student');
    setCurrentStudent(student);
    setAdminName(null);
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ role: 'student', studentId: student.student_id })
    );
    return { success: true };
  };

  const loginAsAdmin = (adminId: string, password?: string): { success: boolean; error?: string } => {
    const cleanId = adminId.trim().toUpperCase();
    if (cleanId === 'LIB-ADMIN' || cleanId === 'ADMIN' || cleanId === 'LIBRARIAN') {
      if (password && password !== 'admin123' && password !== 'password') {
        return { success: false, error: 'Invalid Administrator credentials. Please try again.' };
      }
      setRole('admin');
      setCurrentStudent(null);
      const name = 'Mrs. Elena Santos, RL (Head Librarian)';
      setAdminName(name);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ role: 'admin', adminName: name }));
      return { success: true };
    }
    return { success: false, error: 'Invalid Administrator credentials. Please try again.' };
  };

  const logout = () => {
    setRole('guest');
    setCurrentStudent(null);
    setAdminName(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const switchDemoStudent = (studentId: string) => {
    const student = db.getStudent(studentId);
    if (student) {
      setRole('student');
      setCurrentStudent(student);
      setAdminName(null);
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ role: 'student', studentId: student.student_id })
      );
    }
  };

  const refreshStudentData = () => {
    if (currentStudent) {
      const refreshed = db.getStudent(currentStudent.student_id);
      if (refreshed) {
        setCurrentStudent(refreshed);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        currentStudent,
        adminName,
        loginAsStudent,
        loginAsAdmin,
        logout,
        switchDemoStudent,
        refreshStudentData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
