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