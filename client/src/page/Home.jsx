import React from "react";
import { Link } from "react-router-dom";
import Hero from "../components/Hero.jsx";
import FeatureSection from "../components/FeatureSection.jsx";
import BlogSection from "../components/BlogSection.jsx";


/**
 * Home - Trang chủ của ứng dụng
 *
 * Trang này hiển thị tất cả các thành phần chính của trang landing page
 * và chứa các liên kết đến các trang khác trong ứng dụng.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <FeatureSection />
      <BlogSection />
     
    </>
  );
}
