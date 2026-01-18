'use client'

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import CardActionArea from "@mui/material/CardActionArea";
import React from "react";
import { useRouter } from "next/navigation";
import { Category } from "@/types";

interface CategoryCardProps {
    category: Category
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/courses?tag=${encodeURIComponent(category.name)}`);
    };

    return (
        <Card className="category-card">
            <CardActionArea onClick={handleClick}>
                <CardHeader
                    className="category-card-header"
                    title={category.name}
                />
                <CardContent className="category-card-content">
                    <p>{category.description}</p>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default CategoryCard;
