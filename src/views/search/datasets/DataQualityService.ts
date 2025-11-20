import axios from 'axios';

export async function getDatasetMetrics(datasetId: string) {
    const response = await axios.get(`https://data.europa.eu/api/mqa/cache/datasets/${datasetId}`)
    return response.data;
}

export async function getDistributionsMetrics(datasetId: string) {
    const response = await axios.get(`https://data.europa.eu/api/mqa/cache/datasets/${datasetId}/distributions`)
    return response.data;
}