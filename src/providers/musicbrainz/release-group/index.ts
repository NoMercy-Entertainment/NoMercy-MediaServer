import { Covers } from "../cover";
import axios from "axios";

//artists, releases


export const cover = async (id) => {
    const response = await axios.get<Covers>(`https://coverartarchive.org/release-group/${id}`);

    return response.data.images;
}