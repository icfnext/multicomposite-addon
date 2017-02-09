package com.icfolson.aem.multicompositeaddon.widget;

import com.citytechinc.cq.component.annotations.DialogField;
import com.citytechinc.cq.component.annotations.IgnoreDialogField;
import com.citytechinc.cq.component.dialog.DialogElement;
import com.citytechinc.cq.component.dialog.DialogElementComparator;
import com.citytechinc.cq.component.dialog.DialogFieldConfig;
import com.citytechinc.cq.component.dialog.exception.InvalidComponentClassException;
import com.citytechinc.cq.component.dialog.exception.InvalidComponentFieldException;
import com.citytechinc.cq.component.dialog.factory.WidgetFactory;
import com.citytechinc.cq.component.dialog.maker.AbstractWidgetMaker;
import com.citytechinc.cq.component.dialog.maker.WidgetMakerParameters;
import com.citytechinc.cq.component.dialog.util.DialogUtil;
import com.citytechinc.cq.component.dialog.widgetcollection.WidgetCollection;
import com.citytechinc.cq.component.dialog.widgetcollection.WidgetCollectionParameters;
import com.citytechinc.cq.component.maven.util.ComponentMojoUtil;
import javassist.CannotCompileException;
import javassist.CtMember;
import javassist.CtMethod;
import javassist.NotFoundException;

import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public final class MultiCompositeFieldWidgetMaker extends AbstractWidgetMaker<MultiCompositeFieldWidgetParameters> {

    private static final String FIELD_CONFIGS = "fieldConfigs";

    public MultiCompositeFieldWidgetMaker(final WidgetMakerParameters parameters) {
        super(parameters);
    }

    @Override
    public DialogElement make(MultiCompositeFieldWidgetParameters widgetParameters) throws ClassNotFoundException,
        InvalidComponentFieldException, NotFoundException, CannotCompileException, NoSuchFieldException,
        InstantiationException, IllegalAccessException, InvocationTargetException, NoSuchMethodException {
        final MultiCompositeField multiCompositeFieldAnnotation = getAnnotation(MultiCompositeField.class);

        widgetParameters.setMatchBaseName(multiCompositeFieldAnnotation.matchBaseName());
        widgetParameters.setPrefix(multiCompositeFieldAnnotation.prefix());
        widgetParameters.setContainedElements(buildWidgetCollection());
        widgetParameters.setBaseName(multiCompositeFieldAnnotation.baseName());

        return new MultiCompositeFieldWidget(widgetParameters);
    }

    private List<DialogElement> buildWidgetCollection() throws InvalidComponentFieldException, NotFoundException,
        ClassNotFoundException, CannotCompileException, NoSuchFieldException, InstantiationException,
        IllegalAccessException, InvocationTargetException, NoSuchMethodException {
        final List<CtMember> fieldsAndMethods = new ArrayList<CtMember>();

        fieldsAndMethods.addAll(ComponentMojoUtil.collectFields(getCtType()));
        fieldsAndMethods.addAll(ComponentMojoUtil.collectMethods(getCtType()));

        List<DialogElement> elements = new ArrayList<DialogElement>();

        for (CtMember member : fieldsAndMethods) {
            if (!member.hasAnnotation(IgnoreDialogField.class)) {
                DialogFieldConfig dialogFieldConfig = null;
                if (member instanceof CtMethod) {
                    try {
                        dialogFieldConfig = DialogUtil.getDialogFieldFromSuperClasses((CtMethod) member);
                    } catch (InvalidComponentClassException e) {
                        throw new InvalidComponentFieldException(e.getMessage(), e);
                    }
                } else {
                    if (member.hasAnnotation(DialogField.class)) {
                        dialogFieldConfig =
                            new DialogFieldConfig((DialogField) member.getAnnotation(DialogField.class), member);
                    }
                }

                if (dialogFieldConfig != null) {
                    Class<?> fieldClass = parameters.getClassLoader().loadClass(member.getDeclaringClass().getName());

                    double ranking = dialogFieldConfig.getRanking();

                    final WidgetMakerParameters curFieldMember =
                        new WidgetMakerParameters(dialogFieldConfig, fieldClass, parameters.getClassLoader(),
                            parameters.getClassPool(), parameters.getWidgetRegistry(), null, false);

                    final DialogElement builtFieldWidget = WidgetFactory.make(curFieldMember, -1);
                    if (builtFieldWidget != null) {
                        builtFieldWidget.setRanking(ranking);
                        elements.add(builtFieldWidget);
                    }
                }
            }
        }
        Collections.sort(elements, new DialogElementComparator());
        final WidgetCollectionParameters wcp = new WidgetCollectionParameters();

        wcp.setContainedElements(elements);
        wcp.setFieldName(FIELD_CONFIGS);

        return Arrays.asList(new DialogElement[]{ new WidgetCollection(wcp) });
    }
}
