const imagesContainer = document.getElementById("gallery");
const spinner = document.getElementById("spinner");
const selectFile = document.getElementById("image");
var selectedImage; // a global variable to save the selected image frim the gallery
var res;
const refreshGallery = async () => {
  imagesContainer.innerHTML = "";
  selectFile.removeAttribute("disabled");

  // fetch Images Library List

  const data = await fetch("http://localhost:4000/library", {
    method: "GET",
  });
  const library = await data.json();
  // fetch Images from the library using the provided list
  let images = await Promise.all(
    library.map((image) =>
      fetch(`http://localhost:4000/public/library/${image}`)
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
        selectedImage = null;
      } else {
        for (i = 0; i < imagesContainer.children.length; i++) {
          imagesContainer.children.item(i).classList.remove("selected");
        }
        imageElement.classList.add("selected");
        selectFile.setAttribute("disabled", "true");
        selectFile.value = null;
        selectedImage = imageElement.imgName;
      }
    };
    imagesContainer.appendChild(imageElement);
  });
  spinner.style.display = "none";
};
refreshGallery(); // calls it once to get the images
// Upload Image to the server when a submit button is clicked and then fetches the created image and shows it with other images on the gallery
document.getElementById("submitButton").onclick = async () => {
  const formData = new FormData(document.getElementById("uploadForm"));
  formData.append("selectedImage", selectedImage);
  fetch("http://localhost:4000/ResizeImage", {
    method: "POST",
    body: formData,
  }).then(async (response) => {
    const data = await response.json();
    if (response.ok) {
      document.getElementById("previewImage").setAttribute("src", data.url);
      document.getElementById("url").innerText = data.url;
      refreshGallery();
    } else {
      alert("Error: " + data.err + " Code:" + response.status);
    }
  });
};
