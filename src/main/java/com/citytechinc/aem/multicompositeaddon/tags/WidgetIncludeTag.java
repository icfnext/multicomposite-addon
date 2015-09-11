package com.citytechinc.aem.multicompositeaddon.tags;

import javax.servlet.jsp.JspException;
import javax.servlet.jsp.tagext.TagSupport;

import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ValueMap;

import com.adobe.granite.ui.components.ComponentHelper;
import com.adobe.granite.ui.components.ComponentHelper.Options;
import com.adobe.granite.ui.components.Value;

public class WidgetIncludeTag extends TagSupport {
	private ValueMap valueMap;
	private String path;
	private boolean readOnly;

	@Override
	public int doEndTag() throws JspException {
		SlingHttpServletRequest request = (SlingHttpServletRequest) pageContext.getAttribute("slingRequest");
		ComponentHelper cmp = (ComponentHelper) pageContext.getAttribute("cmp");

		ValueMap existing = (ValueMap) request.getAttribute(Value.FORM_VALUESS_ATTRIBUTE);
		String existingPath = (String) request.getAttribute(Value.CONTENTPATH_ATTRIBUTE);

		if (valueMap == null) {
			request.removeAttribute(Value.FORM_VALUESS_ATTRIBUTE);
			request.removeAttribute(Value.CONTENTPATH_ATTRIBUTE);
		} else {
			request.setAttribute(Value.FORM_VALUESS_ATTRIBUTE, valueMap);
		}

		try {
			Resource field = request.getResourceResolver().getResource(path);
			if (readOnly) {
				cmp.include(field, cmp.getReadOnlyResourceType(field), new Options().rootField(false));
			} else {
				cmp.include(field, new Options().rootField(false));
			}
		} catch (Exception e) {
			throw new JspException("Error including component", e);
		}

		request.setAttribute(Value.FORM_VALUESS_ATTRIBUTE, existing);
		request.setAttribute(Value.CONTENTPATH_ATTRIBUTE, existingPath);

		return EVAL_PAGE;
	}

	public void setValueMap(ValueMap valueMap) {
		this.valueMap = valueMap;
	}

	public void setPath(String path) {
		this.path = path;
	}

	public void setReadOnly(boolean readOnly) {
		this.readOnly = readOnly;
	}
}
