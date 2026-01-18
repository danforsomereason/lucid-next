import React from "react";
import "../styles/Hero.css";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CategoryCard from "./CategoryCard";
import db from "@/db";

const Hero: React.FC = async () => {
    const categories = await db.query.categoriesTable.findMany();

    return (
        <>
            <section className="hero-section">
                <div className="hero-content">
                    <Typography variant="h1" gutterBottom>
                        LEARN, GROW, IMPACT
                    </Typography>
                    <Typography variant="h2" gutterBottom>
                        <span>Impact your client work, faster.</span>
                        <br />
                        Stay <span className="hero-accent">up-to-date</span> and
                        compliant.
                    </Typography>
                    <Typography
                        variant="body1"
                        className="hero-paragraph"
                        gutterBottom
                    >
                        LUCID makes training your team simple. Easily register
                        your employees to start learning and accruing Continuing
                        Education Units toward their licensure requirements.
                        LUCID stays up to date on leading research, state
                        guidelines, and accreditation standards so that you can
                        focus on what you do best: providing exceptional client
                        care!
                    </Typography>
                    <Button variant="contained" color="secondary">
                        Get Started
                    </Button>
                </div>
            </section>
            <section className="hero-category-gallery">
                <Typography variant="h2">
                    Discover the LUCID difference
                </Typography>
                <Typography>
                    Our courses are designed to train your team effeciently with
                    the knowledge they need to succeed. LUCID makes it easy to
                    stay up-to-date on the latest research, state guidelines,
                    and accreditation standards. Simplify your training needs
                    with LUCID.
                </Typography>
                <div className="category-grid">
                    {categories.map((category) => (
                        <div key={category.id}>
                            <CategoryCard category={category} />
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
};

export default Hero;
