package com.icfolson.aem.multicompositeaddon.tags;

import com.adobe.granite.ui.components.ComponentHelper;
import com.adobe.granite.ui.components.ComponentHelper.Options;
import com.adobe.granite.ui.components.FormData;
import com.adobe.granite.ui.components.Value;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ValueMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.osgi.framework.Version;

import javax.servlet.jsp.JspException;
import javax.servlet.jsp.tagext.TagSupport;

public class WidgetIncludeTag extends TagSupport {
    private static final Logger LOG = LoggerFactory.getLogger(WidgetIncludeTag.class);
    private ValueMap valueMap;
    private String path;
    private boolean readOnly;

    @Override
    public int doEndTag() throws JspException {
        final SlingHttpServletRequest request = (SlingHttpServletRequest) pageContext.getAttribute("slingRequest");
        final ComponentHelper cmp = (ComponentHelper) pageContext.getAttribute("cmp");
        final Boolean useFormData = this.useFormData();

        if (valueMap == null) {
            if (useFormData) {
                FormData.push(request, ValueMap.EMPTY, FormData.NameNotFoundMode.IGNORE_FRESHNESS);
            } else {
                request.removeAttribute(Value.FORM_VALUESS_ATTRIBUTE);
                request.removeAttribute(Value.CONTENTPATH_ATTRIBUTE);
            }
        } else {
            if (useFormData) {
                final FormData formData = FormData.from(request);

                FormData.NameNotFoundMode mode = FormData.NameNotFoundMode.IGNORE_FRESHNESS;

                if (formData != null) {
                    mode = formData.getMode();
                }

                FormData.push(request, valueMap, mode);
            } else {
                request.setAttribute(Value.FORM_VALUESS_ATTRIBUTE, valueMap);
            }
        }

        try {
            final Resource field = request.getResourceResolver().getResource(path);

            if (readOnly) {
                cmp.include(field, cmp.getReadOnlyResourceType(field), new Options().rootField(false));
            } else {
                cmp.include(field, new Options().rootField(false));
            }
        } catch (Exception e) {
            throw new JspException("Error including component", e);
        }

        if (useFormData) {
            FormData.pop(request);
        } else {
            request.setAttribute(Value.FORM_VALUESS_ATTRIBUTE, (ValueMap) request.getAttribute(Value.FORM_VALUESS_ATTRIBUTE));
            request.setAttribute(Value.CONTENTPATH_ATTRIBUTE, (String) request.getAttribute(Value.CONTENTPATH_ATTRIBUTE));
        }

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

    private boolean useFormData() {
        boolean formDataAvailable = true;

        try {
            Class.forName( "com.adobe.granite.ui.components.FormData" );
        } catch( ClassNotFoundException e ) {
            formDataAvailable = false;
        }

        return formDataAvailable;
    }
}
