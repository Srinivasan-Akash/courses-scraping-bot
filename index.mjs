import getLinks from './getLinks.js';
import cheerio from 'cheerio';
import fetch from 'node-fetch';
import connectToMongo from './connectToMongo.js';

async function webscrape() {
    const links = await getLinks();
    const client = await connectToMongo();

    for (const link of links) {
        try {
            const response = await fetch(link.links);
            if (response.status !== 200) {
                console.error(`Request failed with status ${response.status}`);
                continue;
            }
            const html = await response.text();
            const $ = cheerio.load(html);

            let courseName, courseDesc, courseInstructors, enrolledStudents, rating, reviews, experience, whatYouWillLearnA, whatYouWillLearnB, whatYouWillLearnC, whatYouWillLearnD, tags, tagTexts, outcomePoints, avgSalary, jobOpenings, gaurenteePercentage, catalog, catalogTexts, courseDuration

            courseName = $('h1').eq(0).text();
            courseDesc = $('.cds-119.css-80vnnb.cds-121').eq(0).text()
            courseInstructors = $('.cds-119.css-80vnnb .cds-121').text()
            enrolledStudents = $('.cds-119.css-80vnnb.cds-121 span strong').text()
            rating = $('.css-guxf6x .cds-119.css-h1jogs.cds-121').eq(0).text()
            reviews = $('.css-lt1dx1 .css-guxf6x .cds-119.css-dmxkm1.cds-121').eq(0).text()
            experience = $('.cds-119.css-h1jogs.cds-121').eq(2).text()
            whatYouWillLearnA = $('.cds-9.css-7avemv.cds-10 li').eq(0).text()
            whatYouWillLearnB = $('.cds-9.css-7avemv.cds-10 li').eq(1).text()
            whatYouWillLearnC = $('.cds-9.css-7avemv.cds-10 li').eq(2).text()
            whatYouWillLearnD = $('.cds-9.css-7avemv.cds-10 li').eq(3).text()
            courseDuration = $('.cds-119.css-h1jogs.cds-121').eq(3).text()
            tags = $('.css-yk0mzy .css-0 .cds-tag-category.cds-tag-primary.cds-tag-default.css-26kv07 .cds-119.css-18p0rob.cds-121')
            tagTexts = [];
            const checkTextAvailability = async ($elements) => {
                const text = $elements.text();
                if (!text) {
                    // If no text is found, wait for a short time and check again
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Adjust the wait time as needed
                    return checkTextAvailability($elements);
                }
                return text;
            };
            
            // Call the function to check for text availability
            await checkTextAvailability(tags);

            avgSalary = $('.cds-119.css-dmxkm1.cds-121 .cds-119.css-bbd009.cds-121').eq(0).text()
            jobOpenings = $('.cds-119.css-dmxkm1.cds-121 .cds-119.css-bbd009.cds-121').eq(1).text()
            gaurenteePercentage = $('.cds-119.css-dmxkm1.cds-121 .cds-119.css-bbd009.cds-121').eq(2).text()
            outcomePoints = $('.css-1g9t2fb').text()
            
            catalog = $('.cds-AccordionRoot-container.cds-AccordionRoot-silent .cds-119.css-h1jogs.cds-121')
            const catalogCourseDuration = $(".cds-AccordionRoot-container.cds-AccordionRoot-silent .cds-119.css-mc13jp.cds-121 span:nth-child(3) span")
            
            catalogTexts = catalog.map((index, element) => {
                return {
                    "index": "Course " + index,
                    "courseName": $(element).text(),
                    // "catalogCourseDuration": catalogCourseDuration,
                    // "catalogCourseDesc": catalogCourseDesc,
                    // "catalogCourseInfo": catalogCourseInfoText
                }
            }).get();

            const db = client.db('courses');
            const collection = db.collection('coursera');
            await collection.insertOne({
                "Title": courseName,
                "Desc": courseDesc,
                "Instructors": courseInstructors,
                "Total Enrolled Students": enrolledStudents,
                "Rating": rating,
                "Duration": courseDuration,
                "Experience": experience,
                "Reviews": reviews,
                "What You Will Learn": (whatYouWillLearnA + ' ' + whatYouWillLearnB + ' ' + whatYouWillLearnC + ' ' + whatYouWillLearnD),
                "Tags": tagTexts,
                "AVG Salary": avgSalary,
                "Job Openings": jobOpenings,
                "Guarantee Percentage": gaurenteePercentage,
                "Outcomes": outcomePoints,
                "Catalog": catalogTexts
            });

            // Insert the data into the MongoDB collection
            
            console.log({
                "Title": courseName,
                "Desc": courseDesc,
                "Instructors": courseInstructors,
                "Total Enrolled Students": enrolledStudents,
                "Rating": rating,
                "Duration": courseDuration,
                "Experience": experience,
                "Reviews": reviews,
                "What You Will Learn": (whatYouWillLearnA + ' ' + whatYouWillLearnB + ' ' + whatYouWillLearnC + ' ' + whatYouWillLearnD),
                "Tags": tagTexts,
                "AVG Salary": avgSalary,
                "Job Openings": jobOpenings,
                "Guarantee Percentage": gaurenteePercentage,
                "Outcomes": outcomePoints,
                "Catalog": catalogTexts
            });
            console.log('-------------------------------------');


        } catch (error) {
            console.error('Error:', error);
        }
    }
    client.close();

}

webscrape();