Table Page {
PageID int [pk, increment]
slug varchar(255) [unique, not null]
is_active boolean [default: true]

// sections -> relationship to PageSections

created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
deleted_at timestamp [null]

Note: 'Minimal page - all content comes from sections'
}

Table PageSection {
SectionID int [pk, increment]
PageID int [ref: > Page.PageID, not null]
slug varchar(255) [not null] // 'hero', 'contact-form', 'testimonials-1', 'about-mission'
title_en varchar(255) [null]
title_ar varchar(255) [null]
subtitle_en text [null]
subtitle_ar text [null]
description_en text [null]
description_ar text [null]

// Visual fields

background_image varchar(500) [null]varchar[]
button_text_en varchar(255) [null]
button_text_ar varchar(255) [null]
button_url varchar(500) [null]
images_url json [null] // ["url1", "url2", "url3"]
video_url varchar (500) // Video filename or URL
sort_order int [default: 0]
is_active boolean [default: true]
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]
deleted_at timestamp [null]

Note: 'Sections identified by slug for maximum flexibility'
}

Table SectionItem {
ItemID int [pk, increment]
SectionID int [ref: > PageSection.SectionID, not null]
slug varchar(255) [not null] // 'testimonial-sara', 'feature-fast-delivery', 'form-email-field'
title_en varchar(255) [null]
title_ar varchar(255) [null]
subtitle_en varchar(255) [null] // job title, step number, etc.
subtitle_ar varchar(255) [null]
description_en text [null]
description_ar text [null]
images_url json[] [null] // array of image URLs
icon varchar(255) [null] // icon class or URL
link_url varchar(500) [null]

// Flexible field for any custom properties
custom_fields json [null] // {"rating": 5, "step_number": 1, "form_type": "email", "required": true}

sort_order int [default: 0]
is_active boolean [default: true]
created_at timestamp [default: `now()`]
updated_at timestamp [default: `now()`]

Note: 'Items identified by slug with flexible custom_fields for any properties'
}

// Relationships
Ref: PageSection.PageID > Page.PageID [delete: cascade]
Ref: SectionItem.SectionID > PageSection.SectionID [delete: cascade]

// Product Catalog

Table "brands" {
"id" bigint(20) [pk, not null]
"title_ar" varchar(191) [not null]
"title_en" varchar(191) [not null]
"is_active" tinyint(1) [not null, default: 1]
"is_featured" tinyint(1) [not null, default: 0]
"is_new" tinyint(1) [not null, default: 1]
"slug" varchar(191) [not null]
"publish_at" datetime [not null]
"meta_keywords_ar" varchar(191) [default: NULL]
"meta_keywords_en" varchar(191) [default: NULL]
"meta_description_ar" varchar(191) [default: NULL]
"meta_description_en" varchar(191) [default: NULL]
"created_at" timestamp [default: NULL]
"updated_at" timestamp [default: NULL]
}

Table "attributes" {
"id" bigint(20) [pk, not null]
"title_ar" varchar(191) [not null]
"title_en" varchar(191) [not null]
"type" tinyint(3) [not null]
"is_required" boolean (1) [not null, default: false]
"code" varchar(191) [not null] (unique )
"created_at" timestamp [default: NULL]
"updated_at" timestamp [default: NULL]
"show_in_filters" tinyint(1) [not null, default: 1]
"filter_group" tinyint(3) [default: NULL]
}

Table "categories" {
"id" bigint(20) [pk, not null]
"title_ar" varchar(191) [not null]// this will be title {ar:string, en :string }
"title_en" varchar(191) [not null] // this will be title {ar:string, en :string }
"is_active" tinyint(1) [not null, default: 1]
"is_featured" tinyint(1) [not null, default: 0]
"parent_id" bigint(20) [default: NULL]
"is_new" tinyint(1) [not null, default: 1]
"slug" varchar(191) [not null]
"meta_keywords_ar" varchar(191) [default: NULL]
"meta_keywords_en" varchar(191) [default: NULL]
"meta_description_ar" varchar(191) [default: NULL]
"meta_description_en" varchar(191) [default: NULL]
"created_at" timestamp [default: NULL]
"updated_at" timestamp [default: NULL]
"is_returnable" tinyint(1) [not null, default: 1]
}

Table general_settings {
id integer [primary key] // Unique identifier for each setting or page
slug varchar // Unique key identifier (e.g., "privacy_policy", "terms_conditions")
title jsonb // Title in multiple languages (e.g., { "ar": "العنوان", "en": "Title" })
description jsonb // Description in multiple languages
image varchar // Image UUID that was uploaded by the media (optional)
is_active boolean // Status: true (active) or false (inactive)
order_number integer // Sorting order
type enum("intro-screen",'setting') // Type of setting or page
theme enum('dark','light')
created_at timestamp // Timestamp when the record was created
updated_at timestamp // Timestamp when the record was last updated
}

Table "addresses" {
"id" bigint(20) [pk, not null]
"first_name" varchar(191) [not null]
"last_name" varchar(191) [not null]
"phone" varchar(191) [default: NULL]
"street_name" varchar(191) [default: NULL]
"building_no" varchar(191) [default: NULL]
"floor_no" varchar(191) [default: NULL]
"address_details" text [default: NULL]
"addressable_type" enum ['work' , 'home']
"country_id" bigint(20) [not null]
"city_id" bigint(20) [not null]
"district_id" bigint(20) [default: NULL]"created_at" timestamp [default: NULL]
"updated_at" timestamp [default: NULL]
}
