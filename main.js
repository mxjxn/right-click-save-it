import "./style.css";
import { ethers } from "ethers";
import axios from "axios";

document.querySelector("#app").innerHTML = `
<div>
    <h1 class="text-2xl font-bold mb-4">Fetch Token Image</h1>
    <form id="tokenForm" class="p-6 flex flex-col gap-4 w-full max-w-md mx-auto">
        <input type="text" id="contractAddress" placeholder="Contract Address" class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600">
        <input type="text" id="tokenId" placeholder="Token ID" class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600">
        <input type="text" id="chainId" placeholder="Chain ID (default 1)" class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600">
        <button onclick="fetchTokenImage(event)" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Fetch Image</button>
    </form>
    <div class="flex justify-center items-center" id="imageContainer"></div>
</div>
`;

window.fetchTokenImage = async (event) => {
  event.preventDefault();
  try {
    const contractAddress = document.getElementById("contractAddress").value;
    const tokenId = document.getElementById("tokenId").value;
    const chainId = document.getElementById("chainId").value || 1;
    console.log(`fart`);
    if (!window.ethereum) {
      throw new Error("Ethereum provider not found");
    }

    console.log(`butt`);
    await window.ethereum.request({ method: "eth_requestAccounts" });
    if (!window.ethereum) {
      console.error(
        "Please use an Ethereum-enabled browser or enable the Ethereum extension."
      );
      return;
    }
    window.ethers = ethers;
    console.log({
      ethers,
      providers: ethers.providers,
      ethereum: window.ethereum,
    });
    const provider = new ethers.BrowserProvider(window.ethereum);

    console.log(
      `contractAddress: ${contractAddress}\ntokenId: ${tokenId}\nchainId: ${chainId}\nprovider: ${provider}`
    );
    const contract = new ethers.Contract(
      contractAddress,
      ["function tokenURI(uint256 tokenId) view returns (string)"],
      provider
    );

    const tokenURI = await contract.tokenURI(parseInt(tokenId));
    console.log(`Token URI: ${tokenURI}`);

    // After fetching tokenURI
    if (tokenURI.startsWith("ipfs://")) {
      tokenURI = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
    }
    const metadataResponse = await axios.get(tokenURI);
    const metadata = metadataResponse.data;
    console.log(`Metadata: `, metadata);

    const imageURI = metadata.image || metadata.image_url;
    if (!imageURI) {
      throw new Error("Image URI not found in metadata");
    }
    if (imageURI.startsWith("ipfs://")) {
      imageURI = imageURI.replace("ipfs://", "https://ipfs.io/ipfs/");
    }

    const imageContainer = document.getElementById("imageContainer");
    imageContainer.innerHTML = `<img src="${imageURI}" class="w-1/3 mx-auto" alt="Token Image">`;
  } catch (error) {
    console.error(`Error fetching token image: ${error.message}`);
  }
};
