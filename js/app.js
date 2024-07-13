const imagesContainer = document.getElementById("gallery");
const spinner = document.getElementById("spinner");
const selectFile = document.getElementById("image");
var selectedImage; // a global variable to save the selected image frim the gallery
(async () => {
  // fetch Images Library List
  const data = await fetch("http://localhost:3001/library", {
    method: "GET",
  });
  const library = await data.json();
  // fetch Images from the library using the provided list
  let images = await Promise.all(
    library.map((image) =>
      fetch(`http://localhost:3001/public/library/${image}`)
    )
  );
  // extracts the images to be actual elements using the blobs
  images.forEach(async (image) => {
    const blob = await image.blob();
    const imageUrl = URL.createObjectURL(blob);
    const imageElement = document.createElement("img");
    imageElement.src = imageUrl;
    imageElement.imgName = await image.url;
    imageElement.className = "gallery-image";
    imageElement.onclick = () => {
      if (imageElement.classList.contains("selected")) {
        imageElement.classList.remove("selected");
        selectFile.removeAttribute("disabled");
      } else {
        for (i = 0; i < imagesContainer.children.length; i++) {
          imagesContainer.children.item(i).classList.remove("selected");
        }
        imageElement.classList.add("selected");
        selectFile.setAttribute("disabled", "true");
        selectedImage = imageElement.imgName;
      }
    };
    imagesContainer.appendChild(imageElement);
  });
  spinner.style.display = "none";
})();

// Upload Image to the server when a submit button is clicked and then fetches the created image and shows it with other images on the gallery
document.getElementById("submitButton").onclick = async () => {
  const formData = new FormData(document.getElementById("uploadForm"));
  formData.append("selectedImage", selectedImage);
  fetch("http://localhost:3001/ResizeImage", {
    method: "POST",
    body: formData,
  }).then(async (response) => {
    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);
    const image = document.createElement("img");
    image.src = imageUrl;
    document.getElementById("preview").appendChild(image);
  });
};
