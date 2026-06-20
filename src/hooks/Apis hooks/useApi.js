import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '../../api/axiosApiConfig';

export const useApiGet = (path, params, queryKey, enabled = true) => {
    const queryFn = () => apiGet(path, params);
    return useQuery({
        queryKey,
        queryFn,
        enabled: !!(path) && enabled
    });
}

export const useApiPost = (queryKey, onSuccessFn = () => { }, useReturnedDataOnSuccessFn = false, onErrorFn = () => { }) => {
    const queryClient = useQueryClient();
    const mutationFn = (sentData) => apiPost(sentData.path, sentData.data, sentData.params);
    return useMutation({
        mutationFn,
        onSuccess: (returnedData, sentData) => {
            queryClient.invalidateQueries({ queryKey });
            onSuccessFn(returnedData, sentData);
        },
        onError: (error) => {
            console.error("Error authenticating :: ", error);
            onErrorFn();
        }
    })
}

export const useApiPut = (queryKey, onSuccessFn = () => { }, onErrorFn = () => { }) => {
    const queryClient = useQueryClient();
    const mutationFn = (sentData) =>
        apiPut(sentData.path, sentData.data ?? {});
    return useMutation({
        mutationFn,
        onSuccess: (returnedData, sentData) => {
            queryClient.invalidateQueries({ queryKey });
            onSuccessFn(returnedData, sentData);
        },
        onError: (error) => {
            console.error("Error authenticating :: ", error);
            onErrorFn();
        }
    })
}

export const useApiPatch = (queryKey, onSuccessFn = () => { }, onErrorFn = () => { }) => {
    const queryClient = useQueryClient();
    const mutationFn = (sentData) =>
        apiPatch(sentData.path, sentData.data ?? {}, sentData.params);
    return useMutation({
        mutationFn,
        onSuccess: (returnedData, sentData) => {
            queryClient.invalidateQueries({ queryKey });
            onSuccessFn(returnedData, sentData);
        },
        onError: (error) => {
            console.error("Error patching data :: ", error);
            onErrorFn();
        }
    })
}

export const useApiDelete = (queryKey, onSuccessFn = () => { }, onErrorFn = () => { }) => {
    const queryClient = useQueryClient();
    const mutationFn = (sentData) =>
        apiDelete(sentData.path, sentData.data ?? {});
    return useMutation({
        mutationFn,
        onSuccess: (returnedData, sentData) => {
            queryClient.invalidateQueries({ queryKey });
            onSuccessFn(returnedData, sentData);
        },
        onError: (error) => {
            console.error("Error authenticating :: ", error);
            onErrorFn();
        }
    })
}