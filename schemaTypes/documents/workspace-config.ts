import {defineArrayMember, defineField, defineType} from 'sanity'
import {CogIcon} from '@sanity/icons/Cog'

export const workspaceConfig = defineType({
  name: 'workspaceConfig',
  title: 'Workspace Config',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'activeObjects',
      title: 'Active Objects',
      description:
        'The desk objects currently rendered on the workspace. Order here maps to the frontend scene.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'deskObject'}],
        }),
      ],
      validation: (rule) => rule.unique(),
    }),
  ],
  preview: {
    select: {activeCount: 'activeObjects.length'},
    prepare: ({activeCount}) => ({
      title: 'Workspace Config',
      subtitle: `${activeCount ?? 0} active object(s)`,
    }),
  },
})
