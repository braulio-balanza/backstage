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
import { KubeConfig } from '@kubernetes/client-node';
import { Labels } from '../K8sObject/models';
import { Errors, success, failure, Context } from 'io-ts';
import { Either, fold } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import { union } from 'lodash'
import equal from 'fast-deep-equal'
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

// Runtime need to analyze lodash union
export const isKubeObject = (input: unknown, kubeObject: IKubeObject): boolean => {
    if (!(input instanceof Object) || !kubeObject.getAttributeTypeMap)
        return false;
    const V1ObjectMetaKeys = getKeysFromTypeMap(kubeObject.getAttributeTypeMap());
    const inputKeys = Object.keys(input);
    const merged = union(V1ObjectMetaKeys, inputKeys)
    return inputKeys.length ? equal(V1ObjectMetaKeys, merged) : false
}

// Runtime need to analyze lodash union
export const isPluginObject = (input: unknown, comparison: unknown): boolean => {
    const comparisonInstance: any = new (<any>comparison)
    if (!(input instanceof Object) || !(comparisonInstance instanceof Object))
        return false
    const inputKeys = Object.keys(input);
    const comparisonKeys = Object.keys(comparisonInstance)
    const merged = union(comparisonKeys, inputKeys)
    return inputKeys.length ? equal(comparisonKeys, merged) : false;
}

export const compareObject = (input: unknown, comparison: unknown): boolean => {
    if (!(input instanceof Object) || !(comparison instanceof Object))
        return false;
    if (comparison.hasOwnProperty('getAttributeTypeMap'))
        return isKubeObject(input, comparison as IKubeObject);
    return isPluginObject(input, comparison);

}

// Mehtod used by typeguard.
export const decodeObject = <T>(
    input: unknown,
    objectToCompare: any,
    context: Context,
    errorMessage?: string): Either<Errors, T> => {
    const Instance: any = objectToCompare;
    if (compareObject(input, objectToCompare)) {
        return success(Object.assign(new Instance, input))
    }
    return failure(input, context, errorMessage)
}

interface IGuard {
    decode: (input: any) => Either<Errors, any>
}

export const decodeResultHandler = <ObjectType>(input: unknown, guard: IGuard): ObjectType | undefined => {
    return input
        ? pipe(guard.decode(input),
            fold(
                errors => {
                    throw new Error(errors.map(error => `${error.message}`).join('\n'))
                },
                content => content
            ))
        : undefined;
}

