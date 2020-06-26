/*
 * Copyright 2020 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { KubeConfig } from '@kubernetes/client-node'
import { Labels } from '../K8sObject/models'
// import { Type } from 'io-ts';

export const isConfigEmpty = (kc: KubeConfig) =>
    (kc.contexts?.length || kc.clusters?.length || kc.users?.length) ? false : true;

export const returnUndefinedArray = (num: number): undefined[] => new Array<undefined>(num)

export const stringifyLabels = (labels: undefined | Labels): string => {
    let labelString: string = '';
    if (labels)
        for (const [key, value] of Object.entries(labels))
            labelString = labelString.concat(`${key}=${value},`);
    return labelString.slice(0, -1);
};
interface TypeMap {
    name: string;
    baseName: string;
    type: string;
}
export const getKeysFromTypeMap = (input: TypeMap[]): Array<string> => {
    const keys = Array<string>();
    input.forEach(typeMap => {
        keys.push(typeMap.name);
    });
    return keys;
}

interface IKubeObject {
    discriminator: string | undefined;
    attributeTypeMap: Array<{
        name: string;
        baseName: string;
        type: string;
    }>
    getAttributeTypeMap: () => {
        name: string;
        baseName: string;
        type: string;
    }[];
}
export const getKeysFromK8sObject = (input: IKubeObject): Array<string> => {
    return getKeysFromTypeMap(input.getAttributeTypeMap());
}

export const isKubeObject = (input: unknown, kubeObject: IKubeObject) => {
    if (!(input instanceof Object))
        return false;
    const V1ObjectMetaKeys = getKeysFromTypeMap(kubeObject.getAttributeTypeMap());
    const inputKeys = Object.keys(input);
    return inputKeys.length ? inputKeys.every(key => V1ObjectMetaKeys.includes(key)) : false
}

// Runtime O(ic)
export const isPluginObject = (input: unknown, comparison: unknown) => {
    if (!(input instanceof Object) || !(comparison instanceof Object))
        return false;
    const inputKeys = Object.keys(input);
    const comparisonKeys = Object.keys(comparison)
    return inputKeys.every(key => comparisonKeys.includes(key))
}