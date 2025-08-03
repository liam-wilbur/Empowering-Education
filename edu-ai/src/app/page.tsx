"use client";

import Link from "next/link";
import React from "react";
import styles from './styles.module.css';

type ServiceCardProps = {
  title: string;
  icon: string;
  linkTo?: string;
};

function ServiceCard({ title, icon, linkTo }: ServiceCardProps) {
  const cardContent = (
    <div className="w-64 h-64 flex flex-col items-center justify-start pt-5 px-4 shadow-md border border-gray-300 cursor-pointer hover:shadow-lg transition-shadow">
      <img src={icon} alt={title} className="w-40 h-40 object-contain" />
      <p className="text-center font-semibold text-sm px-2 mt-4 text-black">{title}</p>
    </div>
  );

  return linkTo ? <Link href={linkTo}>{cardContent}</Link> : cardContent;
}

export default function ServicesPage() {
  return (
    <div className="min-h-screen font-sans bg-white p-10">
      {/* Main Content */}
      <div className="flex flex-col items-center mt-24">
        <div className="flex items-center space-x-4">
          <h1 className="text-6xl font-extrabold text-blue-900 tracking-wide">SERVICES</h1>
        </div>
        <p className="mt-4 text-xl font-semibold text-black">HELP ME WITH...</p>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-10 justify-items-center max-w-5xl mx-auto">
        <ServiceCard
          title="CREATING COLLEGE ESSAYS"
          icon="/images/essay_editing.png"
          linkTo="/essay"
        />
        <ServiceCard
          title="BUILDING A RESUME"
          icon="/images/resume_editing.png"
          linkTo="/resume"
        />
        <ServiceCard
          title="FINDING SCHOOL INFO"                           
          icon="/images/info.png"
          linkTo="/school_info"
        />
      </div>
    </div>
  );
}
