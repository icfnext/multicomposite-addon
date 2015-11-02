package com.citytechinc.aem.multicompositeaddon;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang.StringUtils;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceUtil;
import org.apache.sling.api.resource.ValueMap;

import com.adobe.granite.ui.components.AttrBuilder;
import com.adobe.granite.ui.components.ComponentHelper;
import com.adobe.granite.ui.components.Config;
import com.adobe.granite.ui.components.Tag;
import com.day.cq.i18n.I18n;

public class Multicomposite {
	private final I18n i18n;
	private final String attributes;
	private final List<SubField> fields;
	private final List<ValueMap> values;
	private final String name;
	private final String readOnlyAttributes;
	private final String fieldLabel;
	private final String parentContentPath;
	private final boolean allowReorder;
	private final String baseName;

	public Multicomposite(ComponentHelper component, I18n i18n, SlingHttpServletRequest request) {
		this.i18n = i18n;
		Config config = component.getConfig();
		attributes = buildAttributes(config, component.consumeTag());
		readOnlyAttributes = buildReadOnlyAttributes(component);
		fields = buildFields(config);
		parentContentPath = (String) request.getAttribute("multiParentContentPath");
		name =
			StringUtils.isNotEmpty((String) request.getAttribute("multiPath")) ? (String) request
				.getAttribute("multiPath") : config.get("name");
		String nameForPath = name;
		if (nameForPath.startsWith("./")) {
			nameForPath = nameForPath.substring(2);
		}
		baseName = config.get("baseName", "item_");

		values = buildValues(request, nameForPath);
		fieldLabel = component.getXss().encodeForHTML(i18n.getVar(config.get("fieldLabel", "")));
		allowReorder = config.get("allowReorder", true);
	}

	private String buildAttributes(Config config, Tag consumeTag) {
		AttrBuilder attrBuilder = consumeTag.getAttrs();
		attrBuilder.add("id", config.get("id", String.class));
		attrBuilder.addRel(config.get("rel", String.class));
		attrBuilder.addClass(config.get("class", String.class));
		attrBuilder.add("title", i18n.getVar(config.get("title", String.class)));

		attrBuilder.addClass("coral-Multifield");
		attrBuilder.add("data-init", "multicompositefield");

		attrBuilder.addOthers(config.getProperties(), "id", "rel", "class", "title", "fieldLabel", "fieldDescription",
			"renderReadOnly");

		return attrBuilder.build();
	}

	private String buildReadOnlyAttributes(ComponentHelper component) {
		AttrBuilder attrBuilder = component.consumeTag().getAttrs();
		if (component.getOptions().rootField()) {
			attrBuilder.addClass("coral-Form-fieldwrapper");
		}
		return attrBuilder.build();
	}

	private List<SubField> buildFields(Config config) {
		List<SubField> fields = new ArrayList<SubField>();
		Resource fieldsResource = config.getChild("fields");
		if (fieldsResource != null && !ResourceUtil.isNonExistingResource(fieldsResource)) {
			for (Resource fieldResource : fieldsResource.getChildren()) {
				fields.add(new SubField(fieldResource));
			}
		}
		return fields;
	}

	private List<ValueMap> buildValues(SlingHttpServletRequest request, String name) {
		List<ValueMap> values = new ArrayList<ValueMap>();
		Resource instanceResource = request.getRequestPathInfo().getSuffixResource();
		if (instanceResource != null && !ResourceUtil.isNonExistingResource(instanceResource)) {
			final Resource containerResource = instanceResource.getChild(name);
			if (containerResource != null && !ResourceUtil.isNonExistingResource(containerResource)) {
				for (Resource instanceItem : containerResource.getChildren()) {
					values.add(instanceItem.getValueMap());
				}
			}
		}
		return values;
	}

	public String getAttributes() {
		return attributes;
	}

	public List<SubField> getFields() {
		return fields;
	}

	public List<ValueMap> getValues() {
		return values;
	}

	public String getName() {
		return name;
	}

	public String getReadOnlyAttributes() {
		return readOnlyAttributes;
	}

	public String getFieldLabel() {
		return fieldLabel;
	}

	public class SubField {

		private final String name;
		private final String resourceType;
		private final String path;

		public SubField(final Resource component) {
			ValueMap valueMap = component.adaptTo(ValueMap.class);
			this.name = valueMap.get("name", "");
			this.path = component.getPath();
			this.resourceType = component.getResourceType();
		}

		public String getPath() {
			return path;
		}

		public String getName() {
			return name;
		}

		public String getResourceType() {
			return resourceType;
		}
	}

	public String getParentContentPath() {
		return parentContentPath;
	}

	public boolean isAllowReorder() {
		return allowReorder;
	}

	public String getBaseName() {
		return baseName;
	}
}
