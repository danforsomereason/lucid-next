'use client'
import React, { useState, useEffect, useRef } from "react";
import {
  Grid,
  Divider,
  FormGroup,
  Typography,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormControlLabel,
  Checkbox,
  Box,
  SelectChangeEvent,
} from "@mui/material";
import Pagination from "@mui/material/Pagination";
import CourseCard from "@/components/CourseCard";
import { getCourses, getCoursesByCategory } from "@/requests/courses";
import "@/styles/Courses.css";
import { useSearchParams } from "next/navigation";
import { Course } from "@/types";

const tags = [
  "Human Resources",
  "Treatment",
  "Addiction",
  "Ethics & Legal",
  "Cultural Diversity",
  "Confidentiality",
];

const licenseTypes = [
  "Mental Health Counselor (e.g., LPC, LMHC)",
  "Social Worker",
  "Marriage & Family Therapist",
  "Licensed Drug and Alcohol Counselor (e.g., LADAC, LCDC)",
  "Nurse",
  "Psychologist",
  "Physician",
  "Other",
  "Not Applicable",
];

const Courses: React.FC = () => {
  const searchRef = useRef<HTMLDivElement | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedLicenseTypes, setSelectedLicenseTypes] = useState<string[]>(
    []
  );
  const [sortOption, setSortOption] = useState("recommended");
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 12;
  const searchParams = useSearchParams();

  console.log('courses', courses)

  // Scroll to search list
  const handleBrowseClick = () => {
    if (searchRef.current) {
      searchRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Fetch courses from the server
  useEffect(() => {
    async function download() {
      const categoryId = searchParams.get("category");
      if (categoryId) {
        console.log("Category ID from URL:", categoryId);

        const data = await getCoursesByCategory(categoryId)
        // console.log("Course data structure:", data[0]);
        // console.log("Course ID type:", typeof data[0]._id);
        // console.log("Course ID value:", data[0]._id);
        // console.log("Filtered courses:", data);
        setCourses(data);
        setFilteredCourses(data);
      } else {
        const data = await getCourses()
        // console.log("Course data structure:", data[0]);
        // console.log("Course ID type:", typeof data[0]._id);
        // console.log("Course ID value:", data[0]._id);
        // console.log("All courses:", data);
        setCourses(data);
        setFilteredCourses(data);
      }
    }
    download()
  }, [searchParams]);

  // Update filtered courses based on search, tags, and license types
  useEffect(() => {
    let results = courses.filter((course) => {
      const matchesSearch = course.title
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesTag = selectedTags.length
        ? false // selectedTags.some((tag) => course..includes(tag))
        : true;
      const matchesLicense = selectedLicenseTypes.length
        ? false
        // ? selectedLicenseTypes.some((type) =>
        //   course.course_tags.includes(type)
        // )
        : true;

      return matchesSearch && matchesTag && matchesLicense;
    });
    setFilteredCourses(results);
    setCurrentPage(1); // Reset to first page when filters change
  }, [search, selectedTags, selectedLicenseTypes, courses]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleTagChange = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleLicenseTypeChange = (type: string) => {
    setSelectedLicenseTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const handleSortChange = (event: SelectChangeEvent<string>) => {
    setSortOption(event.target.value);
  };

  const handleClearFilters = () => {
    setSelectedTags([]);
    setSelectedLicenseTypes([]);
    setSearch("");
  };

  // Pagination logic
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(
    indexOfFirstCourse,
    indexOfLastCourse
  );
  const handlePageChange = (e: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  useEffect(() => {
    const tagFromUrl = searchParams.get("tag");
    if (tagFromUrl) {
      setSelectedTags((prev) =>
        prev.includes(tagFromUrl) ? prev : [...prev, tagFromUrl]
      );
    }
  }, [searchParams]);

  return (
    <>
      <Box
        className="courses-hero-section"
        sx={{
          padding: {
            xs: "10vh 5vw",
            sm: "15vh 10vw",
            md: "20vh 15vw",
          },
          textAlign: "center",
        }}
      >
        <Typography variant="h2" gutterBottom>
          All the courses you need - in one place.
        </Typography>
        <Typography variant="body1" gutterBottom component="div">
          <Box>
            Find the perfect course for you, whether you're looking
            to learn a new skill, maintain your licensure, or stay
            up to date on leading research.
          </Box>
          <br />
          <Box>
            LUCID CEU offers a wide range of courses in various
            disciplines, including social work, counseling, and
            nursing. We also help you cover the basics from
            handwashing to HIPAA compliance.
          </Box>
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 4, zIndex: 1 }}
          onClick={handleBrowseClick}
        >
          Browse
        </Button>
      </Box>

      <Box>
        {/* Filter and sorting controls section */}
        <Box
          ref={searchRef}
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
            padding: "0 10vw",
            mt: 2,
            mb: 4,
          }}
        >
          <TextField
            label="Search"
            variant="outlined"
            value={search}
            onChange={handleSearch}
            sx={{
              mt: 2,
              width: "100%",
              backgroundColor: "var(--white-color)",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "var(--color-indigo-250)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "var(--color-indigo-450)",
              },
            }}
          />
          <FormControl variant="outlined">
            <InputLabel sx={{ color: "var(--color-indigo-450)" }}>
              Sort By
            </InputLabel>
            <Select
              label="Sort By"
              value={sortOption}
              onChange={handleSortChange}
              sx={{
                backgroundColor: "var(--white-color)",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--color-indigo-250)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--color-indigo-450)",
                },
              }}
            >
              <MenuItem value="recommended">Recommended</MenuItem>
              <MenuItem value="free">Free</MenuItem>
              <MenuItem value="length-CE-hours-desc">
                CE Hours High to Low
              </MenuItem>
              <MenuItem value="length-CE-hours-asc">
                CE Hours Low to High
              </MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleClearFilters}
          >
            Clear Filters
          </Button>
        </Box>
        {/* Sidebar and Mapped Courses side-by-side */}
        <Box sx={{ display: "flex", padding: "0 10vw" }}>
          {/* Sidebar */}
          <Box
            sx={{
              width: "20%",
              paddingRight: "2rem",
              display: { xs: "none", md: "block" },
            }}
          >
            <Typography variant="h6" gutterBottom>
              Filter
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Typography variant="subtitle1" fontWeight="bold">
              Tags
            </Typography>
            <FormGroup>
              {tags.map((tag) => (
                <FormControlLabel
                  key={tag}
                  control={
                    <Checkbox
                      checked={selectedTags.includes(tag)}
                      onChange={() =>
                        handleTagChange(tag)
                      }
                    />
                  }
                  label={tag}
                />
              ))}
            </FormGroup>

            <Typography
              variant="subtitle1"
              fontWeight="bold"
              sx={{ mt: 2 }}
            >
              License Type
            </Typography>
            <FormGroup>
              {licenseTypes.map((type) => (
                <FormControlLabel
                  key={type}
                  control={
                    <Checkbox
                      checked={selectedLicenseTypes.includes(
                        type
                      )}
                      onChange={() =>
                        handleLicenseTypeChange(type)
                      }
                    />
                  }
                  label={type}
                />
              ))}
            </FormGroup>
          </Box>

          {/* Mapped Courses & Pagination */}
          <Box className="course-">
            <Grid className="course-grid">
              {currentCourses.map((course) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  key={course.id}
                >
                  <CourseCard
                    course={course}
                    className="course-card"
                  ></CourseCard>
                </Grid>
              ))}
            </Grid>
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={Math.ceil(
                  filteredCourses.length / coursesPerPage
                )}
                page={currentPage}
                onChange={handlePageChange}
                color="secondary"
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Courses;