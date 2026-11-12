import {defineArrayMember, defineField, defineType} from 'sanity'
import {UserIcon} from '@sanity/icons/User'

export const profile = defineType({
  name: 'profile',
  title: 'Profile',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroTagline',
      title: 'Hero Tagline',
      description: 'One-liner under the name on the Standard View hero.',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'availability',
      title: 'Availability',
      type: 'object',
      initialValue: {isAvailable: true, statusText: 'Available for work', timezone: 'Asia/Jakarta'},
      fields: [
        defineField({name: 'isAvailable', title: 'Available for work', type: 'boolean'}),
        defineField({name: 'statusText', title: 'Status text', type: 'string'}),
        defineField({
          name: 'timezone',
          title: 'Timezone',
          description: 'IANA name, e.g. Asia/Jakarta.',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'faq',
      title: 'FAQ',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'faqItem',
          title: 'Question',
          type: 'object',
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'answer',
              title: 'Answer',
              type: 'text',
              validation: (rule) => rule.required(),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'resume',
      title: 'Resume',
      type: 'object',
      fields: [
        defineField({
          name: 'headline',
          title: 'Headline',
          type: 'array',
          of: [defineArrayMember({type: 'block'})],
        }),
        defineField({
          name: 'file',
          title: 'Resume file (PDF)',
          type: 'file',
          options: {accept: 'application/pdf'},
        }),
        defineField({
          name: 'links',
          title: 'Links',
          type: 'array',
          of: [
            defineArrayMember({
              name: 'link',
              title: 'Link',
              type: 'object',
              fields: [
                defineField({
                  name: 'label',
                  title: 'Label',
                  type: 'string',
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: 'href',
                  title: 'URL',
                  type: 'url',
                  validation: (rule) => rule.required(),
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'array',
      of: [defineArrayMember({type: 'block'})],
    }),
    defineField({
      name: 'philosophy',
      title: 'Philosophy',
      description: 'One-line working philosophy (e.g. clean code).',
      type: 'text',
    }),
    defineField({
      name: 'experiences',
      title: 'Experience',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'experience'}]})],
    }),
    defineField({
      name: 'stack',
      title: 'Tech Stack',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'stackItem',
          title: 'Stack Item',
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'category',
              title: 'Category',
              type: 'string',
              options: {
                list: [
                  {title: 'Framework', value: 'framework'},
                  {title: 'Language', value: 'language'},
                  {title: 'Tool', value: 'tool'},
                  {title: 'Cloud', value: 'cloud'},
                  {title: 'Database', value: 'database'},
                ],
                layout: 'radio',
              },
              validation: (rule) => rule.required(),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'services',
      title: 'Services',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'service',
          title: 'Service',
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'contact',
      title: 'Contact',
      type: 'object',
      fields: [
        defineField({
          name: 'email',
          title: 'Email',
          type: 'string',
          validation: (rule) => rule.email().required(),
        }),
        defineField({
          name: 'bookingUrl',
          title: 'Booking URL',
          description: 'Optional scheduling link. When empty, "Hire me" opens an email instead.',
          type: 'url',
          validation: (rule) => rule.uri({scheme: ['https']}),
        }),
        defineField({
          name: 'blurb',
          title: 'Blurb',
          description: 'One-line text shown in the contact section/modal.',
          type: 'text',
          rows: 2,
        }),
        defineField({
          name: 'socials',
          title: 'Social Links',
          type: 'array',
          of: [
            defineArrayMember({
              name: 'social',
              title: 'Social',
              type: 'object',
              fields: [
                defineField({
                  name: 'platform',
                  title: 'Platform',
                  type: 'string',
                  description:
                    'e.g. github, linkedin, x, instagram… Known names get their icon in the UI.',
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: 'url',
                  title: 'URL',
                  type: 'url',
                  validation: (rule) => rule.required(),
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'siteConfig',
      title: 'Site Config',
      description:
        'Global copy: brand, headings, CTAs, nav items. Leave empty to use the built-in defaults.',
      type: 'object',
      fields: [
        defineField({name: 'brand', title: 'Brand', type: 'string'}),
        defineField({name: 'splashLine', title: 'Splash Line', type: 'string'}),
        defineField({name: 'heroTagline', title: 'Hero Tagline', type: 'text', rows: 3}),
        defineField({name: 'metaTitle', title: 'Meta Title', type: 'string'}),
        defineField({name: 'metaDescription', title: 'Meta Description', type: 'text', rows: 2}),
        defineField({
          name: 'headings',
          title: 'Section Headings',
          type: 'object',
          fields: [
            defineField({name: 'about', title: 'About', type: 'string'}),
            defineField({name: 'stack', title: 'Stack', type: 'string'}),
            defineField({name: 'showcase', title: 'Showcase', type: 'string'}),
            defineField({name: 'contact', title: 'Contact', type: 'string'}),
            defineField({name: 'resume', title: 'Resume', type: 'string'}),
            defineField({name: 'projects', title: 'Projects', type: 'string'}),
            defineField({name: 'journal', title: 'Journal', type: 'string'}),
            defineField({name: 'experience', title: 'Experience', type: 'string'}),
          ],
        }),
        defineField({
          name: 'ctas',
          title: 'CTA Labels',
          type: 'object',
          fields: [
            defineField({name: 'caseStudy', title: 'View Project', type: 'string'}),
            defineField({name: 'resume', title: 'View Resume', type: 'string'}),
            defineField({name: 'readCaseStudy', title: 'View Project (card)', type: 'string'}),
            defineField({name: 'email', title: 'Email Me', type: 'string'}),
          ],
        }),
        defineField({
          name: 'categoryLabels',
          title: 'Stack Category Labels',
          type: 'object',
          fields: [
            defineField({name: 'framework', title: 'Framework', type: 'string'}),
            defineField({name: 'language', title: 'Language', type: 'string'}),
            defineField({name: 'tool', title: 'Tool', type: 'string'}),
            defineField({name: 'cloud', title: 'Cloud', type: 'string'}),
            defineField({name: 'database', title: 'Database', type: 'string'}),
          ],
        }),
        defineField({
          name: 'navItems',
          title: 'Navigation Items',
          description: 'HUD buttons. id must match a content id or slug.',
          type: 'array',
          of: [
            defineArrayMember({
              name: 'navItem',
              title: 'Nav Item',
              type: 'object',
              fields: [
                defineField({
                  name: 'id',
                  title: 'ID',
                  description: 'Content id or slug (e.g. "showcase", "jrn-japanese").',
                  type: 'string',
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: 'label',
                  title: 'Label',
                  type: 'string',
                  validation: (rule) => rule.required(),
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'name'},
  },
})
