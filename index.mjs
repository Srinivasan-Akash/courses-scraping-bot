import getLinks from './getLinks.js';
import cheerio from 'cheerio';
import fetch from 'node-fetch';
import connectToMongo from './connectToMongo.js';

function extractTexts($, selector, type) {
    if (type === "href") {
        return $(selector).map((index, element) => $(element).attr('href')).get();
    } else {
        return $(selector).map((index, element) => $(element).text()).get();
    }
}

function extractTagTexts($, selectors) {
    const texts = [];
    selectors.forEach(selector => {
        $(selector).each((index, element) => {
            const text = $(element).text();
            if (text) {
                texts.push(text);
            }
        });
    });
    return texts;
}

async function webscrape() {
    console.log("Starting webscraping...");
    const links = await getLinks();
    const client = await connectToMongo();
    const db = client.db('courses');
    const collection = db.collection('coursera');

    for (const { links: url } of links) {
        try {
            const response = await fetch(url);
            if (response.status !== 200) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            const html = await response.text();
            const $ = cheerio.load(html);

            const visibleTagsSelector = '#about .css-yk0mzy .css-0';
            const hiddenTagsSelector = '#about .css-yk0mzy .css-k26awr';
            const tagTexts = extractTagTexts($, [visibleTagsSelector, hiddenTagsSelector]);
            const internalTags = extractTagTexts($, ['.cds-AccordionRoot-container.cds-AccordionRoot-silent .css-yk0mzy .css-18p0rob.cds-121'])
            const internalWhatYouWillLearn = extractTexts($, '.cds-AccordionRoot-container.cds-AccordionRoot-silent .css-1otrsh1 + ul li')

            const courseCatalogs = $('.cds-AccordionRoot-container.cds-AccordionRoot-silent .cds-119.cds-Typography-base.css-h1jogs.cds-121')
            .map((index, element) => {
                const prefix = ".cds-AccordionRoot-container.cds-AccordionRoot-silent";
                return {
                    title: extractTexts($, `${prefix} .cds-119.cds-Typography-base.css-h1jogs.cds-121`)[index],
                    link: "https://www.coursera.org" + extractTexts($, `${prefix} .cds-119.cds-Typography-base.css-h1jogs.cds-121 a`, "href")[index],
                    duration: extractTexts($, `${prefix} .css-mc13jp span span`)[index],
                    rating: extractTexts($, `${prefix} .css-mc13jp .css-1tdi49m`)[index],
                    internalTags: JSON.stringify(internalTags),
                    whatYouWillLearn: JSON.stringify(internalWhatYouWillLearn),
                };
            }).get();

            const courseInfo = {
                Title: $('h1').first().text(),
                Desc: $('.cds-119.css-80vnnb.cds-121').first().text(),
                Instructors: $('.cds-119.css-80vnnb .cds-121').text(),
                TotalEnrolledStudents: $('.cds-119.css-80vnnb.cds-121 span strong').text(),
                Rating: $('.css-guxf6x .cds-119.css-h1jogs.cds-121').first().text(),
                Duration: $('.cds-119.css-h1jogs.cds-121').eq(3).text(),
                Experience: $('.cds-119.css-h1jogs.cds-121').eq(2).text(),
                Reviews: $('.css-lt1dx1 .css-guxf6x .cds-119.css-dmxkm1.cds-121').first().text(),
                WhatYouWillLearn: extractTexts($, '.cds-9.css-7avemv.cds-10 li'),
                Tags: tagTexts,
                AVGSalary: $('.cds-119.css-dmxkm1.cds-121 .cds-119.css-bbd009.cds-121').first().text(),
                JobOpenings: $('.cds-119.css-dmxkm1.cds-121 .cds-119.css-bbd009.cds-121').eq(1).text(),
                GuaranteePercentage: $('.cds-119.css-dmxkm1.cds-121 .cds-119.css-bbd009.cds-121').eq(2).text(),
                Outcomes: $('.css-1g9t2fb').text(),
                Catalog: courseCatalogs,
            };

            const result = await collection.insertOne(courseInfo);
            console.log(`Inserted document with _id: ${result.insertedId}`);
        } catch (error) {
            console.error(`Error while processing URL: ${url}`, error);
        }
    }

    await client.close();
    console.log("Webscraping process completed.");
}

webscrape();
