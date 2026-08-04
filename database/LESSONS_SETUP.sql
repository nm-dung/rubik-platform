-- SUPABASE SQL SETUP FOR LESSONS TABLE
-- Run this in your Supabase SQL Editor to create the lessons table

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_vi TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_vi TEXT NOT NULL,
  content_en TEXT,
  content_vi TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  "order" INT NOT NULL DEFAULT 0,
  duration_minutes INT,
  related_algorithm_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better query performance
CREATE INDEX idx_lessons_difficulty ON lessons(difficulty);
CREATE INDEX idx_lessons_order ON lessons("order");

-- ============================================================
-- SAMPLE DATA - Beginner Path (Layer-by-Layer Method)
-- ============================================================

INSERT INTO lessons (id, title_en, title_vi, description_en, description_vi, difficulty, "order", duration_minutes, related_algorithm_ids) VALUES

('lesson-b-001', 'Understanding the Rubik''s Cube', 'Hiểu biết về Khối Rubik', 
 'Learn the basic structure of the cube: centers, edges, and corners. Understand notation and cube anatomy.', 
 'Tìm hiểu cấu trúc cơ bản của khối: tâm, cạnh, và góc. Hiểu ký hiệu và giải phẫu khối.',
 'beginner', 1, 15, '{}'),

('lesson-b-002', 'Solving the White Cross', 'Giải quyết Chữ thập Trắng',
 'Master the first step: solving the white cross on the bottom layer without disturbing the center pieces.',
 'Nắm vững bước đầu tiên: giải quyết chữ thập trắng trên lớp dưới cùng mà không làm xáo trộn các mảnh tâm.',
 'beginner', 2, 20, '{}'),

('lesson-b-003', 'White Corners & First Layer', 'Các góc Trắng & Lớp Đầu tiên',
 'Complete the first layer by inserting the white corner pieces into the correct positions.',
 'Hoàn thành lớp đầu tiên bằng cách chèn các mảnh góc trắng vào đúng vị trí.',
 'beginner', 3, 20, '{}'),

('lesson-b-004', 'Middle Layer - Edge Pieces', 'Lớp Giữa - Các mảnh Cạnh',
 'Solve the middle layer by correctly placing the edge pieces between the top and bottom layers.',
 'Giải quyết lớp giữa bằng cách đặt chính xác các mảnh cạnh giữa các lớp trên cùng và dưới cùng.',
 'beginner', 4, 25, '{}'),

('lesson-b-005', 'Yellow Cross & Orientation', 'Chữ thập Vàng & Định hướng',
 'Create the yellow cross on the top layer and orient all edge pieces correctly.',
 'Tạo chữ thập vàng trên lớp trên cùng và định hướng tất cả các mảnh cạnh chính xác.',
 'beginner', 5, 20, '{}'),

('lesson-b-006', 'Last Layer - Corners & Finish', 'Lớp Cuối cùng - Góc & Hoàn thành',
 'Position and orient the yellow corner pieces to complete your first Rubik''s Cube solve!',
 'Đặt vị trí và định hướng các mảnh góc vàng để hoàn thành lần giải đầu tiên của bạn!',
 'beginner', 6, 30, '{}');

-- ============================================================
-- SAMPLE DATA - Intermediate Path (CFOP Method)
-- ============================================================

INSERT INTO lessons (id, title_en, title_vi, description_en, description_vi, difficulty, "order", duration_minutes, related_algorithm_ids) VALUES

('lesson-i-001', 'Introduction to CFOP', 'Giới thiệu về CFOP',
 'Understand the CFOP method (Fridrich method) used by 99% of speed cubers worldwide.',
 'Hiểu phương pháp CFOP (phương pháp Fridrich) được sử dụng bởi 99% những người giải tốc độ trên thế giới.',
 'intermediate', 1, 20, '{}'),

('lesson-i-002', 'CFOP: Cross Optimization', 'CFOP: Tối ưu hóa Chữ thập',
 'Solve the cross in just 8 rotations or less. Learn efficient cross-solving strategies.',
 'Giải quyết chữ thập trong chỉ 8 lần quay hoặc ít hơn. Tìm hiểu các chiến lược giải quyết chữ thập hiệu quả.',
 'intermediate', 2, 25, '{}'),

('lesson-i-003', 'F2L: First 2 Layers Pairing', 'F2L: Ghép cặp 2 Lớp Đầu tiên',
 'Learn to insert corner-edge pairs simultaneously. This is where speed cubers save the most time.',
 'Tìm hiểu cách chèn các cặp góc-cạnh cùng lúc. Đây là nơi những người giải tốc độ tiết kiệm nhiều thời gian nhất.',
 'intermediate', 3, 30, '{}'),

('lesson-i-004', 'OLL: Orient Last Layer', 'OLL: Định hướng Lớp Cuối cùng',
 'Master one or all 57 OLL algorithms to orient the last layer in a single rotation.',
 'Thành thạo một hoặc tất cả 57 thuật toán OLL để định hướng lớp cuối cùng trong một lần quay duy nhất.',
 'intermediate', 4, 35, '{}'),

('lesson-i-005', 'PLL: Permute Last Layer', 'PLL: Hoán vị Lớp Cuối cùng',
 'Learn the 21 essential PLL algorithms to permute the last layer and complete the cube.',
 'Tìm hiểu 21 thuật toán PLL cơ bản để hoán vị lớp cuối cùng và hoàn thành khối.',
 'intermediate', 5, 40, '{}');

-- ============================================================
-- SAMPLE DATA - Advanced Path (Speed Cubing)
-- ============================================================

INSERT INTO lessons (id, title_en, title_vi, description_en, description_vi, difficulty, "order", duration_minutes, related_algorithm_ids) VALUES

('lesson-a-001', 'Advanced F2L Techniques', 'Kỹ thuật F2L Nâng cao',
 'Learn intuitive F2L, rotationless solving, and advanced pair recognition.',
 'Tìm hiểu F2L trực quan, giải quyết không xoay, và nhận dạng cặp nâng cao.',
 'advanced', 1, 40, '{}'),

('lesson-a-002', 'OLL Recognition Mastery', 'Thành thạo Nhận dạng OLL',
 'Speed up OLL recognition and execution. Learn groupings and common patterns.',
 'Tăng tốc độ nhận dạng và thực hiện OLL. Tìm hiểu các nhóm và mẫu phổ biến.',
 'advanced', 2, 35, '{}'),

('lesson-a-003', 'Roux Method Introduction', 'Giới thiệu Phương pháp Roux',
 'Explore the alternative Roux method: a strong alternative to CFOP for some cubers.',
 'Khám phá phương pháp Roux thay thế: một lựa chọn mạnh mẽ thay thế CFOP cho một số người giải.',
 'advanced', 3, 45, '{}'),

('lesson-a-004', 'Advanced Rotationless Solving', 'Giải quyết Nâng cao Không xoay',
 'Minimize rotations and develop muscle memory for lightning-fast solves.',
 'Giảm thiểu các lần quay và phát triển trí nhớ cơ bắp để giải quyết cực nhanh.',
 'advanced', 4, 30, '{}');

-- ============================================================
-- IMPORTANT: You can add lessons anytime through your Supabase dashboard
-- Just insert new rows with the same structure
-- ============================================================
