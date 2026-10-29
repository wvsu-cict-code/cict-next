"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { newsHref } from "@/lib/news";

interface NewsArticleCardProps {
    slug: string;
    imgSrc?: string;
    date: string;
    header: string;
    description?: string;
}

const NewsArticleCard: React.FC<NewsArticleCardProps> = ({ slug, imgSrc, date, header, description }) => {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className="flex md:flex-col rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow bg-white">

            {/* Image */}
            <div className="relative w-40 sm:w-42 md:w-full md:h-48 lg:h-56 flex-shrink-0">
                {/* Skeleton */}
                {isLoading && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                )}

                {/* Image */}
                {imgSrc && (
                    <Image
                        src={imgSrc}
                        alt={header}
                        fill
                        className="object-cover"
                        priority
                        onLoadingComplete={() => setIsLoading(false)}
                    />
                )}
            </div>

            {/* Content */}
            <div className="sm:py-4 py-2 sm:px-6 pl-3 pr-2 flex flex-col justify-between flex-1">
                <div className="space-y-1 md:space-y-3">
                    <div className="flex flex-row justify-between text-[0.7rem] sm:text-xs ">
                        <p className=" text-[#4D4D4D]/80 pt-1">{date}</p>
                        <p className="font-bold text-white sm:px-2 px-1 py-1  bg-orange-light rounded-md">NEWS</p>
                    </div>

                    <h3 className="text-lg sm:text-xl font-major font-bold">{header}</h3>
                    {description ? (
                        <p className="hidden md:block text-sm font-minor text-[#000000]/60 line-clamp-3 leading-loose sm:leading-normal">
                            {description}
                        </p>
                    ) : (
                        <p className="text-sm font-minor text-gray-400 italic line-clamp-3">
                            No summary provided
                        </p>
                    )}
                </div>

                {/* Read More Button */}
                <Link
                    href={newsHref(slug)}
                    className="text-xs sm:text-sm font-minor font-semibold text-white tracking-wider mt-0 sm:mt-2 px-3 py-1 self-start sm:self-end bg-orange-dark border border-orange-dark rounded-full cursor-pointer transition-colors duration-300 ease-in-out hover:text-orange-dark hover:bg-white hover:border-orange-dark"
                >
                    Read More &nbsp;→
                </Link>
            </div>
        </div>
    );
};

export default NewsArticleCard;