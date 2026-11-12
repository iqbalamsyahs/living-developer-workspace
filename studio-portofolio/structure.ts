import type {StructureResolver} from 'sanity/structure'
import {CogIcon} from '@sanity/icons/Cog'
import {UserIcon} from '@sanity/icons/User'

// Singleton document types: pinned to a fixed _id via Structure and hidden
// from the generic document type list to prevent duplicates.
const SINGLETONS = ['workspaceConfig', 'profile']

function createSingleton(
  S: Parameters<StructureResolver>[0],
  typeName: string,
  title: string,
  icon: React.ComponentType,
) {
  return S.listItem()
    .title(title)
    .icon(icon)
    .child(S.document().schemaType(typeName).documentId(typeName).title(title))
}

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      createSingleton(S, 'workspaceConfig', 'Workspace Config', CogIcon),
      createSingleton(S, 'profile', 'Profile', UserIcon),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (listItem) => !SINGLETONS.includes(listItem.getId() as string),
      ),
    ])
