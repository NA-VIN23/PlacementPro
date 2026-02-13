-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'STAFF', 'STUDENT')),
  email TEXT UNIQUE,
  registration_number TEXT UNIQUE, -- Nullable for Admin/Staff
  department TEXT,
  batch TEXT,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT -- Added based on screenshot
);

-- 2. Student Profiles
CREATE TABLE student_profiles (
  student_id UUID PRIMARY KEY REFERENCES users(id),
  bio TEXT,
  linkedin TEXT,
  github TEXT,
  skills TEXT[], -- Stored as array of text based on screenshot implies it might be text or array
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Profile Internships
CREATE TABLE profile_internships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id),
  role TEXT,
  company TEXT,
  duration TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Profile Projects
CREATE TABLE profile_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id),
  title TEXT,
  description TEXT,
  tech_stack TEXT, -- snake_case in DB
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Profile Education
CREATE TABLE profile_education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id),
  degree TEXT,
  school TEXT,
  year TEXT,
  score TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Profile Certifications
CREATE TABLE profile_certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id),
  title TEXT,
  issuer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Exams Table
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  type TEXT CHECK (type IN ('DAILY', 'WEEKLY')) DEFAULT 'DAILY',
  mode TEXT CHECK (mode IN ('MANUAL', 'PDF')) DEFAULT 'MANUAL',
  pdf_url TEXT
);

-- 8. Questions Table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- Storing array of strings as JSON
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  section TEXT,
  question_type TEXT DEFAULT 'MCQ', -- 'MCQ', 'CODING', 'TEXT'
  code_template TEXT,
  test_cases JSONB, -- Array of {input, output, hidden}
  constraints TEXT,
  function_name TEXT
);

-- 9. Submissions Table
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id),
  exam_id UUID REFERENCES exams(id),
  attempt_no INTEGER DEFAULT 1,
  score INTEGER NOT NULL,
  answers JSONB NOT NULL, -- Storing answers as JSON Record<qId, answer>
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Mock Interviews Table
CREATE TABLE mock_interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id),
  interview_type TEXT CHECK (interview_type IN ('HR', 'TECHNICAL')),
  room_name TEXT,
  score INTEGER,
  fluency_score INTEGER,
  grammar_score INTEGER,
  communication_score INTEGER,
  confidence_score INTEGER,
  correctness_score INTEGER,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Resumes Table
CREATE TABLE resumes ( 
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), 
     student_id UUID REFERENCES users(id), 
     resume_data JSONB NOT NULL, 
     score INTEGER, 
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() 
);
