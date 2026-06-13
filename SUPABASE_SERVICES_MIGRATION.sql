-- ========================================
-- SUPABASE SERVICES MIGRATION
-- Run in Supabase SQL Editor
-- ========================================

-- 1) Create table: services
-- Used by:
--  - src/pages/Admin.tsx (admin CRUD + sort_order)
--  - src/components/ServicesSection.tsx (public fetch ordered by sort_order)

CREATE TABLE IF NOT EXISTS services (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
import React, { useCallback, useState } from "react";
  title text NOT NULL,
  price text NOT NULL,
  features text[] NOT NULL DEFAULT ARRAY[]::text[],
  icon_name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_services_sort_order ON services(sort_order);
CREATE INDEX IF NOT EXISTS idx_services_title ON services(title);

-- 2) Enable Row Level Security (RLS)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- 3) Policies
-- Public can view services
DROP POLICY IF EXISTS "Services are viewable by everyone" ON services;
CREATE POLICY "Services are viewable by everyone"
ON services FOR SELECT
USING (true);

-- Authenticated users can insert/update/delete (admin is authenticated)
DROP POLICY IF EXISTS "Services can be inserted by authenticated users" ON services;
CREATE POLICY "Services can be inserted by authenticated users"
ON services FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Services can be updated by authenticated users" ON services;
CREATE POLICY "Services can be updated by authenticated users"
ON services FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Services can be deleted by authenticated users" ON services;
CREATE POLICY "Services can be deleted by authenticated users"
ON services FOR DELETE
TO authenticated
USING (true);

