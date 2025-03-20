import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { FC } from "react";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaTelegram,
  FaYoutube,
  FaGithub,
} from "react-icons/fa";

const Home: React.FC = () => {
  useEffect(() => {
    // YouTube Channel ID
    const channelId = "UCfKzSQKzglavmUBszeud4xg";
    const apiKey = "AIzaSyDMTjD2xzvtTmjyCAK-ZbkpF_tZxcLYcIw";
    const maxResults = 3;

    // Function to fetch and display YouTube videos
    async function loadYouTubeVideos() {
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=${maxResults}`
        );
        const data = await response.json();

        const videoContainer = document.getElementById("youtube-videos");
        if (!videoContainer) return;

        if (data.items) {
          data.items.forEach((item) => {
            if (item.id.videoId) {
              const videoItem = document.createElement("div");
              videoItem.className = "video-item";

              videoItem.innerHTML = `
                <iframe src="https://www.youtube.com/embed/${item.id.videoId}" 
                  title="${item.snippet.title}" 
                  frameborder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowfullscreen>
                </iframe>
                <div class="video-title">${item.snippet.title}</div>
              `;

              videoContainer.appendChild(videoItem);
            }
          });
        }
      } catch (error) {
        console.error("Error fetching YouTube videos:", error);
        // Fallback to display a message or default videos
        const videoContainer = document.getElementById("youtube-videos");
        if (videoContainer) {
          videoContainer.innerHTML = `
            <p>Visit our <a href="https://youtube.com/@surveyorstories" target="_blank">YouTube channel</a> to see all videos.</p>
          `;
        }
      }
    }

    loadYouTubeVideos();
  }, []);

  return (
    <div
      id="root"
      className=" mx-auto  p-6 mb-8 text-center flex flex-col items-center"
    >
      <header className="header">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-center text-gray-800">
            Resurvey Notice Generator
          </h1>
        </div>
      </header>

      <main className="container mx-auto">
        <section className="">
          <div className="">
            <p className="text-gray-600 mb-4">
              This is the home page of the Notice Generation project, featuring
              Ground Truthing Notice Generation and Ground Validation Notice
              Generation for Resurvey.
            </p>
            <Link
              to="groundtruthingnotice"
              className="inline-block bg-blue-600 mb-4 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Ground Truthing Notice Generation
            </Link>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-700 m-4">
              Connect With Us
            </h3>
            <div className="flex justify-center space-x-9 mb-4">
              <a
                href="https://t.me/surveyor_stories"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-500 transition-colors"
              >
                <FaTelegram size={30} />
              </a>
              <a
                href="https://youtube.com/@surveyorstories"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-red-500 transition-colors"
              >
                <FaYoutube size={30} />
              </a>
              <a
                href="https://github.com/surveyorstories"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FaGithub size={30} />
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* YouTube Videos Section */}
      {/* <div className="youtube-section text-center w-full">
        <h2>Latest Videos</h2>
        <div className="video-container" id="youtube-videos">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4">
          </div>
        </div>
      </div> */}
    </div>
  );
};
export default Home;
