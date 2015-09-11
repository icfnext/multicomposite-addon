package com.citytechinc.aem.multicompositeaddon.widget;

import com.citytechinc.cq.component.annotations.config.Widget;
import com.citytechinc.cq.component.dialog.AbstractWidget;

@Widget(annotationClass = MultiCompositeField.class, makerClass = MultiCompositeFieldWidgetMaker.class,
	xtype = MultiCompositeFieldWidget.XTYPE)
public final class MultiCompositeFieldWidget extends AbstractWidget {

	public static final String XTYPE = "multicompositefield";

	private final boolean matchBaseName;

	private final String prefix;

	public MultiCompositeFieldWidget(final MultiCompositeFieldWidgetParameters parameters) {
		super(parameters);

		this.matchBaseName = parameters.isMatchBaseName();
		this.prefix = parameters.getPrefix();
	}

	public String getPrefix() {
		return prefix;
	}

	public boolean isMatchBaseName() {
		return matchBaseName;
	}
}