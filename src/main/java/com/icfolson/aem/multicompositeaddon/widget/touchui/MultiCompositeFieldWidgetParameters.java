/**
 * Copyright 2013 CITYTECH, Inc.
 * <p>
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * <p>
 * http://www.apache.org/licenses/LICENSE-2.0
 * <p>
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.icfolson.aem.multicompositeaddon.widget.touchui;

import com.citytechinc.cq.component.touchuidialog.TouchUIDialogElement;
import com.citytechinc.cq.component.touchuidialog.container.items.Items;
import com.citytechinc.cq.component.touchuidialog.container.items.ItemsParameters;
import com.citytechinc.cq.component.touchuidialog.widget.DefaultTouchUIWidgetParameters;
import com.citytechinc.cq.component.xml.XmlElement;

import java.util.ArrayList;
import java.util.List;

public class MultiCompositeFieldWidgetParameters extends DefaultTouchUIWidgetParameters {

    protected List<TouchUIDialogElement> items;

    private boolean allowReorder;

    private String baseName;

    private boolean matchBaseName;

    private Integer limit;

    public void addItem(TouchUIDialogElement item) {
        if (items == null) {
            items = new ArrayList<TouchUIDialogElement>();
        }

        items.add(item);
    }

    public List<TouchUIDialogElement> getItems() {
        return items;
    }

    public void setItems(List<TouchUIDialogElement> items) {
        this.items = items;
    }

    public Items getItemsElement() {
        ItemsParameters itemsParameters = new ItemsParameters();

        itemsParameters.setFieldName("fields");

        List<XmlElement> elements = new ArrayList<XmlElement>();

        if (!getItems().isEmpty()) {
            elements.addAll(getItems());
            itemsParameters.setContainedElements(elements);
            return new Items(itemsParameters);
        }

        return null;
    }

    @Override
    public List<? extends XmlElement> getContainedElements() {
        List<XmlElement> allContainedElements = new ArrayList<XmlElement>();

        Items items = getItemsElement();

        if (items != null) {
            allContainedElements.add(items);
        }

        if (containedElements != null) {
            allContainedElements.addAll(containedElements);
        }

        return allContainedElements;
    }

    @Override
    public String getResourceType() {
        return MultiCompositeFieldWidget.RESOURCE_TYPE;
    }

    @Override
    public void setResourceType(String resourceType) {
        throw new UnsupportedOperationException("resourceType is Static for MultiCompositeFieldWidget");
    }

    public boolean isAllowReorder() {
        return allowReorder;
    }

    public void setAllowReorder(boolean allowReorder) {
        this.allowReorder = allowReorder;
    }

    public String getBaseName() {
        return baseName;
    }

    public void setBaseName(String baseName) {
        this.baseName = baseName;
    }

    public boolean isMatchBaseName() {
        return matchBaseName;
    }

    public void setMatchBaseName(boolean matchBaseName) {
        this.matchBaseName = matchBaseName;
    }

    public Integer getLimit() {
        return limit;
    }

    public void setLimit(final Integer limit) {
        this.limit = limit;
    }
}
